import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { OtherIncomeEmplAuthService } from '../other-income/shared/services/other-income-empl-auth.service';
import { ToastService } from '../service/toast/toast.service';
import { BranchPharmacistService } from './branch-pharmacist.service';
import {
  LICENCE_NO_MAX_LENGTH,
  PHARMACIST_GROUP_LABEL,
  TBranchFilter,
  TBranchPharmacist,
  TBranchPharmacistPeriod,
  TPharmacistCandidate,
} from './branch-pharmacist.types';
import { apiErrorMessage, filterBranches, isReady, searchCandidates, summarize } from './branch-pharmacist.util';

type TBusy = 'licence' | 'assign' | 'end' | null

/**
 * Setup page for each branch's drug-sale licence number and assigned pharmacist. The POS signs the
 * ข.ย.๙ / ข.ย.๑๑ registers with the pharmacist assigned at print time and prints the licence number on
 * the drug label; a branch without a pharmacist cannot print either register.
 * Rules: DrugPOSApp docs/pages/reports/BRANCH-PHARMACIST-HANDOFF.md §3 (enforced by the API).
 *
 * One branch is open at a time, as an editor row under its table row -- no modal.
 */
@Component({
  selector: 'app-branch-pharmacist-page',
  imports: [DatePipe],
  templateUrl: './branch-pharmacist-page.component.html',
  styleUrl: './branch-pharmacist-page.component.scss',
})
export class BranchPharmacistPageComponent {
  private readonly service = inject(BranchPharmacistService)
  private readonly auth = inject(OtherIncomeEmplAuthService)
  private readonly toast = inject(ToastService)

  readonly licenceMaxLength = LICENCE_NO_MAX_LENGTH
  readonly groupLabel = PHARMACIST_GROUP_LABEL
  readonly isReady = isReady

  readonly employee = this.auth.employee

  // ── list ──
  readonly loading = signal(true)
  readonly error = signal('')
  readonly branches = signal<TBranchPharmacist[]>([])
  readonly keyword = signal('')
  readonly filter = signal<TBranchFilter>('all')

  readonly summary = computed(() => summarize(this.branches()))
  readonly visible = computed(() => filterBranches(this.branches(), this.keyword(), this.filter()))

  // ── editor (one branch at a time) ──
  readonly openCode = signal<string | null>(null)
  readonly open = computed(() => this.branches().find(b => b.branchCode === this.openCode()) ?? null)
  readonly busy = signal<TBusy>(null)
  readonly editorError = signal('')

  readonly licenceDraft = signal('')
  readonly licenceChanged = computed(() => {
    const draft = this.licenceDraft().trim()
    return draft.length > 0 && draft !== (this.open()?.licenceNo ?? '')
  })

  readonly candidates = signal<TPharmacistCandidate[]>([])
  readonly candidatesLoading = signal(false)
  readonly candidateKeyword = signal('')
  readonly picked = signal<TPharmacistCandidate | null>(null)
  readonly candidateResult = computed(() =>
    searchCandidates(this.candidates(), this.candidateKeyword(), this.open()?.pharmacistCode ?? null))

  /** End is two clicks: the first arms it, the second sends it. */
  readonly endArmed = signal(false)

  readonly history = signal<TBranchPharmacistPeriod[]>([])
  readonly historyLoading = signal(false)

  constructor() {
    this.load()
  }

  load() {
    this.loading.set(true)
    this.error.set('')
    this.service.list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: rows => this.branches.set(rows),
        error: err => this.error.set(apiErrorMessage(err) ?? 'โหลดรายการสาขาไม่สำเร็จ'),
      })
  }

  setFilter(filter: TBranchFilter) {
    this.filter.set(filter)
  }

  toggle(branch: TBranchPharmacist) {
    if (this.openCode() === branch.branchCode) {
      this.openCode.set(null)
      return
    }
    this.openCode.set(branch.branchCode)
    this.resetEditor(branch)
    this.loadHistory(branch.branchCode)
    this.loadCandidates()
  }

  private resetEditor(branch: TBranchPharmacist) {
    this.licenceDraft.set(branch.licenceNo ?? '')
    this.candidateKeyword.set('')
    this.picked.set(null)
    this.endArmed.set(false)
    this.editorError.set('')
  }

  private loadCandidates(refresh = false) {
    if (this.candidates().length && !refresh) return
    this.candidatesLoading.set(true)
    this.service.getCandidates(refresh)
      .pipe(finalize(() => this.candidatesLoading.set(false)))
      .subscribe({
        next: rows => this.candidates.set(rows),
        error: err => this.editorError.set(apiErrorMessage(err) ?? 'โหลดรายชื่อเภสัชกรไม่สำเร็จ'),
      })
  }

  private loadHistory(branchCode: string) {
    this.history.set([])
    this.historyLoading.set(true)
    this.service.history(branchCode)
      .pipe(finalize(() => this.historyLoading.set(false)))
      .subscribe({
        // A slow answer for a branch the user has already left must not land in the next one.
        next: rows => { if (this.openCode() === branchCode) this.history.set(rows) },
        error: () => { /* history is supporting detail; the editor still works without it */ },
      })
  }

  pick(candidate: TPharmacistCandidate) {
    this.picked.set(candidate)
    this.endArmed.set(false)
    this.editorError.set('')
  }

  saveLicence() {
    const branch = this.open()
    const emplCode = this.employee()?.emplCode
    if (!branch || !emplCode || !this.licenceChanged() || this.busy()) return
    this.run('licence', this.service.setLicence(branch.branchCode, this.licenceDraft().trim(), emplCode),
      'บันทึกเลขที่ใบอนุญาตแล้ว', 'บันทึกเลขที่ใบอนุญาตไม่สำเร็จ')
  }

  assign() {
    const branch = this.open()
    const picked = this.picked()
    const emplCode = this.employee()?.emplCode
    if (!branch || !picked || !emplCode || this.busy()) return
    this.run('assign', this.service.assign(branch.branchCode, picked.emplCode, emplCode),
      `กำหนด ${picked.emplName} เป็นเภสัชกรประจำสาขาแล้ว`, 'กำหนดเภสัชกรไม่สำเร็จ', true)
  }

  end() {
    const branch = this.open()
    const emplCode = this.employee()?.emplCode
    if (!branch?.pharmacistCode || !emplCode || this.busy()) return
    if (!this.endArmed()) {
      this.endArmed.set(true)
      return
    }
    this.run('end', this.service.end(branch.branchCode, emplCode),
      'สิ้นสุดการประจำสาขาแล้ว', 'สิ้นสุดการประจำสาขาไม่สำเร็จ', true)
  }

  /** Sends one write, swaps the returned row into the list, and re-syncs the editor from it. */
  private run(kind: Exclude<TBusy, null>, request: ReturnType<BranchPharmacistService['assign']>,
              done: string, failed: string, assignmentChanged = false) {
    this.busy.set(kind)
    this.editorError.set('')
    request.pipe(finalize(() => this.busy.set(null))).subscribe({
      next: row => {
        this.branches.update(rows => rows.map(b => b.branchCode === row.branchCode ? row : b))
        if (this.openCode() === row.branchCode) {
          this.resetEditor(row)
          if (assignmentChanged) {
            this.loadHistory(row.branchCode)
            // "active at N branches" in the picker is now stale.
            this.loadCandidates(true)
          }
        }
        this.toast.success(done)
      },
      error: err => {
        this.endArmed.set(false)
        this.editorError.set(apiErrorMessage(err) ?? failed)
        this.toast.danger(failed)
      },
    })
  }
}
