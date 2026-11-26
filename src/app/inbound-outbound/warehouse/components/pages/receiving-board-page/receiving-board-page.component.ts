import { Component, computed, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { finalize, Observable } from 'rxjs';
import { OtherIncomeEmplAuthService } from '../../../../../other-income/shared/services/other-income-empl-auth.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { ReceivingApiService } from '../../../services/receiving-api.service';
import { WalkInCheckInFormComponent } from '../../forms/walk-in-check-in-form/walk-in-check-in-form.component';
import {
  apiErrorMessage,
  buildTimeline,
  busyGates,
  companiesLabel,
  freeGates,
  GATE_TYPE_LABEL,
  gateTypeOf,
  isSuggestedGate,
  preferredGateTypeOf,
  minutesLabel,
  parseBillCount,
  PUNCTUALITY_LABEL,
  SIZE_LABEL,
} from '../../../../shared/libs/receiving.util';
import {
  TGateBoard,
  TReceivingBoard,
  TReceivingSettings,
  TReceivingWindow,
  TVisit,
  TWalkInDraft,
} from '../../../../shared/types/receiving.type';

/** Only one warehouse receives goods today; the code is the one seeded by the API's migration. */
export const WAREHOUSE_CODE = 'BMS'
export const REFRESH_MS = 30_000

/**
 * The gate-house screen: check a truck in, see the queue in calling order, send the next truck to a
 * free gate, release it when it is done. The supplier never picks a gate — it is chosen here, when
 * the truck is called (docs: other-income-api InboundOutbound/docs/receiving-slot-design.md).
 *
 * Destructive or unusual actions (cancel, doubling up a gate) are two clicks: the first arms the
 * button, the second sends it. No modal.
 */
@Component({
  selector: 'app-receiving-board-page',
  imports: [DatePipe, WalkInCheckInFormComponent],
  templateUrl: './receiving-board-page.component.html',
  styleUrl: './receiving-board-page.component.scss',
})
export class ReceivingBoardPageComponent {
  private readonly api = inject(ReceivingApiService)
  private readonly auth = inject(OtherIncomeEmplAuthService)
  private readonly toast = inject(ToastService)

  private readonly walkInForm = viewChild(WalkInCheckInFormComponent)

  readonly sizeLabel = SIZE_LABEL
  readonly punctualityLabel = PUNCTUALITY_LABEL
  readonly companiesLabel = companiesLabel
  readonly minutesLabel = minutesLabel
  readonly gateTypeLabel = GATE_TYPE_LABEL
  readonly gateTypeOf = gateTypeOf
  readonly preferredGateTypeOf = preferredGateTypeOf
  readonly isSuggestedGate = isSuggestedGate

  readonly employee = this.auth.employee

  readonly loading = signal(true)
  readonly error = signal('')
  readonly settings = signal<TReceivingSettings | null>(null)
  readonly board = signal<TReceivingBoard | null>(null)
  readonly windows = signal<TReceivingWindow[]>([])

  /** The board (default) or the Bookings-style day grid. */
  readonly view = signal<'board' | 'timeline'>('board')
  readonly timeline = computed(() => {
    const b = this.board()
    return b ? buildTimeline(b, this.windows()) : null
  })

  /** True while a write is in flight: every action button is disabled. */
  readonly busy = signal(false)

  readonly free = computed(() => freeGates(this.board()?.gates ?? []))
  readonly occupied = computed(() => busyGates(this.board()?.gates ?? []))

  /** Bill count typed for a booked truck that is arriving, per visit id. */
  readonly arrivalBills = signal<Record<number, string>>({})

  /** `cancel:<visitId>` or `double:<visitId>:<gateId>` — the button waiting for its second click. */
  readonly armed = signal<string | null>(null)

  readonly showDone = signal(false)

  constructor() {
    this.api.getConfig(WAREHOUSE_CODE).subscribe({
      next: config => {
        this.settings.set(config.settings)
        this.windows.set(config.windows ?? [])
      },
      error: err => this.error.set(apiErrorMessage(err) ?? 'โหลดการตั้งค่าคลังไม่สำเร็จ'),
    })
    this.load()

    const timer = setInterval(() => { if (!this.busy()) this.load(true) }, REFRESH_MS)
    inject(DestroyRef).onDestroy(() => clearInterval(timer))
  }

  /** `quiet` = the background refresh: no spinner, and a failure keeps the last board on screen. */
  load(quiet = false) {
    if (!quiet) this.loading.set(true)
    this.api.getBoard(WAREHOUSE_CODE)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: board => {
          this.board.set(board)
          this.error.set('')
        },
        error: err => this.error.set(apiErrorMessage(err) ?? 'โหลดคิวรับสินค้าไม่สำเร็จ'),
      })
  }

  // ── check-in ──

  checkInWalkIn(draft: TWalkInDraft) {
    this.run(
      this.api.checkInWalkIn({ ...draft, warehouseCode: WAREHOUSE_CODE, checkedInBy: this.emplCode() }),
      visit => {
        this.walkInForm()?.reset()
        return `เช็คอินแล้ว คิวที่ ${visit.queueNo} — ${visit.supplierName}`
      },
    )
  }

  setArrivalBills(visit: TVisit, value: string) {
    this.arrivalBills.update(all => ({ ...all, [visit.id]: value }))
  }

  arrivalBillsOf(visit: TVisit): string {
    return this.arrivalBills()[visit.id] ?? String(visit.billCount)
  }

  checkInBooked(visit: TVisit) {
    const billCount = parseBillCount(this.arrivalBillsOf(visit))
    if (!billCount) {
      this.toast.danger('จำนวนบิลต้องเป็นเลข 1–200')
      return
    }
    this.run(
      this.api.checkInBooked(visit.id, { billCount, truckPlate: null, checkedInBy: this.emplCode() }),
      updated => `เช็คอินแล้ว คิวที่ ${updated.queueNo} — ${updated.supplierName}`,
    )
  }

  // ── gate ──

  assignGate(visit: TVisit, gate: TGateBoard) {
    const doubling = gate.unloading.length > 0
    const key = `double:${visit.id}:${gate.id}`
    if (doubling && this.armed() !== key) {
      this.armed.set(key)
      return
    }
    this.run(
      this.api.assignGate(visit.id, gate.id, doubling),
      updated => `คิวที่ ${updated.queueNo} เข้าประตู ${updated.gateName}`,
    )
  }

  isDoubleArmed(visit: TVisit, gate: TGateBoard): boolean {
    return this.armed() === `double:${visit.id}:${gate.id}`
  }

  finish(visit: TVisit) {
    this.run(this.api.finish(visit.id), updated => `ปล่อยรถแล้ว — ${updated.supplierName}`)
  }

  // ── cancel ──

  cancel(visit: TVisit) {
    const key = `cancel:${visit.id}`
    if (this.armed() !== key) {
      this.armed.set(key)
      return
    }
    this.run(this.api.cancel(visit.id, null), updated => `ยกเลิกแล้ว — ${updated.supplierName}`)
  }

  isCancelArmed(visit: TVisit): boolean {
    return this.armed() === `cancel:${visit.id}`
  }

  private emplCode(): string | null {
    return this.employee()?.emplCode ?? null
  }

  /** One write at a time; whatever the outcome the board is reloaded, since a refusal means it was stale. */
  private run(request: Observable<TVisit>, message: (visit: TVisit) => string) {
    if (this.busy()) return
    this.busy.set(true)
    request
      .pipe(finalize(() => {
        this.busy.set(false)
        this.armed.set(null)
        this.load(true)
      }))
      .subscribe({
        next: visit => this.toast.success(message(visit)),
        error: err => this.toast.danger(apiErrorMessage(err) ?? 'ทำรายการไม่สำเร็จ ลองใหม่อีกครั้ง'),
      })
  }
}
