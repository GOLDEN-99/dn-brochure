import { Component, computed, inject, input, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { ReceivingApiService } from '../../../services/receiving-api.service';
import { classifyBills, parseBillCount, SIZE_LABEL } from '../../../../shared/libs/receiving.util';
import { TReceivingSettings, TSupplierHit, TWalkInDraft } from '../../../../shared/types/receiving.type';

/**
 * Gate-house form for a truck that arrives without a booking. The supplier is a free-text name
 * (a distributor truck carries many vendor codes); picking a suggestion only attaches the vendor
 * code and ticks its company.
 */
@Component({
  selector: 'receiving-walk-in-check-in-form',
  templateUrl: './walk-in-check-in-form.component.html',
})
export class WalkInCheckInFormComponent {
  private readonly api = inject(ReceivingApiService)

  readonly settings = input<TReceivingSettings | null>(null)
  readonly busy = input(false)
  readonly submitted = output<TWalkInDraft>()

  readonly sizeLabel = SIZE_LABEL

  readonly supplierName = signal('')
  readonly picked = signal<TSupplierHit | null>(null)
  readonly carriesDn = signal(false)
  readonly carriesHu = signal(false)
  readonly billCount = signal('1')
  readonly truckPlate = signal('')
  readonly note = signal('')
  readonly touched = signal(false)

  /** Suggestions follow the typed name, and stop once one is picked. */
  private readonly keyword = computed(() => this.picked() ? '' : this.supplierName().trim())
  readonly suggestions = toSignal(
    toObservable(this.keyword).pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(keyword => keyword.length >= 2 ? this.api.searchSuppliers(keyword) : of([] as TSupplierHit[])),
    ),
    { initialValue: [] as TSupplierHit[] },
  )

  readonly bills = computed(() => parseBillCount(this.billCount()))
  readonly size = computed(() => {
    const bills = this.bills()
    const settings = this.settings()
    return bills && settings ? classifyBills(bills, settings) : null
  })

  readonly errors = computed(() => ({
    supplierName: this.supplierName().trim() ? '' : 'กรอกชื่อผู้ส่งสินค้า',
    company: this.carriesDn() || this.carriesHu() ? '' : 'เลือกบริษัทของบิลอย่างน้อย 1 บริษัท',
    billCount: this.bills() ? '' : 'จำนวนบิลต้องเป็นเลข 1–200',
  }))
  readonly valid = computed(() => Object.values(this.errors()).every(message => !message))

  typeSupplier(value: string) {
    this.supplierName.set(value)
    this.picked.set(null)
  }

  pick(hit: TSupplierHit) {
    this.picked.set(hit)
    this.supplierName.set(hit.compName)
    if (hit.compType === 'DN') this.carriesDn.set(true)
    else this.carriesHu.set(true)
  }

  submit() {
    this.touched.set(true)
    if (!this.valid() || this.busy()) return
    const picked = this.picked()
    this.submitted.emit({
      supplierName: this.supplierName().trim(),
      compCode: picked?.compCode ?? null,
      compType: picked?.compType ?? null,
      carriesDn: this.carriesDn(),
      carriesHu: this.carriesHu(),
      billCount: this.bills()!,
      truckPlate: this.truckPlate().trim() || null,
      driverPhone: null,
      note: this.note().trim() || null,
      orders: [],
    })
  }

  /** Called by the page once the check-in was accepted. */
  reset() {
    this.supplierName.set('')
    this.picked.set(null)
    this.carriesDn.set(false)
    this.carriesHu.set(false)
    this.billCount.set('1')
    this.truckPlate.set('')
    this.note.set('')
    this.touched.set(false)
  }
}
