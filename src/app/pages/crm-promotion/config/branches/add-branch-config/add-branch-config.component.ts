import { Component, computed, inject, input, signal } from '@angular/core';
import { BranchConfigService } from '../../../../../service/crm-promotion/branch-config.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, EMPTY, filter, map, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-branch-config',
  imports: [FormsModule, RouterLink],
  templateUrl: './add-branch-config.component.html',
  styles: '',
})
export class AddBranchConfigComponent {
  private readonly branchConfig = inject(BranchConfigService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  // ── inputs & current group data ─────────────────────────────────────────────
  branchGroupId = input<number>()
  private readonly branchGroup$ = toObservable(this.branchGroupId)
  private readonly next$ = new BehaviorSubject(0);

  private readonly branchInGroup$ = combineLatest([this.next$, this.branchGroup$])
    .pipe(
      map(([_, id]) => Number(id)),
      filter(v => !Number.isNaN(v)),
      switchMap(groupId => this.branchConfig.getByGroupId(groupId))
    )
  currentBranchInGroup = toSignal(this.branchInGroup$, { initialValue: [] })
  currentBranchSet = computed(() => new Set(this.currentBranchInGroup().map(b => b.branchCode)))

  // ── reference data ───────────────────────────────────────────────────────────
  allBranches = this.branchConfig.allBranches
  readonly priceLevelRef = ['1', '2', '3', '4', '5', '6']
  readonly allBranchZone = this.branchConfig.allBranchZone
  readonly allOldBranchGroup = this.branchConfig.allOldBranchGroup

  // ── filter state ─────────────────────────────────────────────────────────────
  filterOptions = signal<TBranchFilterOption>({
    branchName: '',
    branchGroupCode: [],
    branchZoneCode: [],
    branchPrice: [],
  })

  // ── sort state ───────────────────────────────────────────────────────────────
  sortCol = signal<'branchCode' | 'branchName' | null>(null)
  sortDir = signal<'asc' | 'desc'>('asc')

  toggleSort(col: 'branchCode' | 'branchName') {
    if (this.sortCol() === col) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      this.sortCol.set(col)
      this.sortDir.set('asc')
    }
  }

  // ── filtered branch list ─────────────────────────────────────────────────────
  filteredBranches = computed(() => {
    const { branchName, branchPrice, branchGroupCode, branchZoneCode } = this.filterOptions()
    const nameLower = branchName.toLowerCase()
    const col = this.sortCol()
    const dir = this.sortDir()

    const filtered = this.allBranches()
      .filter(b => !this.currentBranchSet().has(b.branchCode))
      .filter(b => !nameLower || b.branchName.toLowerCase().includes(nameLower))
      .filter(b => branchPrice.length === 0 || branchPrice.includes(b.branchPrice))
      .filter(b => branchGroupCode.length === 0 || branchGroupCode.includes(b.branchGroupCode))
      .filter(b => branchZoneCode.length === 0 || branchZoneCode.includes(b.branchZoneCode))

    if (!col) return filtered

    return [...filtered].sort((a, b) => {
      const cmp = (a[col] ?? '').localeCompare(b[col] ?? '', 'th')
      return dir === 'asc' ? cmp : -cmp
    })
  })

  // ── selection state ──────────────────────────────────────────────────────────
  selectedCodes = signal<Set<string>>(new Set())

  isSelected(code: string) {
    return this.selectedCodes().has(code)
  }

  toggleSelect(code: string) {
    this.selectedCodes.update(s => {
      const next = new Set(s)
      next.has(code) ? next.delete(code) : next.add(code)
      return next
    })
  }

  selectedCount = computed(() => this.selectedCodes().size)

  // ── save ─────────────────────────────────────────────────────────────────────
  saving = signal(false)
  saveError = signal<string | null>(null)

  confirmAdd() {
    const groupId = this.branchGroupId()
    if (!groupId) return
    const codes = [...this.selectedCodes()]
    if (codes.length === 0) return
    this.saving.set(true)
    this.saveError.set(null)
    this.branchConfig.addBranchesToGroup(groupId, codes).pipe(
      catchError((err: HttpErrorResponse) => {
        this.saveError.set(err.error?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        this.saving.set(false)
        return EMPTY
      })
    ).subscribe(() => {
      this.saving.set(false)
      this.router.navigate(['..'], { relativeTo: this.route })
    })
  }

  // ── delete ───────────────────────────────────────────────────────────────────
  deletingId = signal<number | null>(null)
  deleteError = signal<string | null>(null)

  deleteBranch(listId: number) {
    this.deletingId.set(listId)
    this.deleteError.set(null)
    this.branchConfig.deleteBranchFromGroup(listId).pipe(
      catchError((err: HttpErrorResponse) => {
        this.deleteError.set(err.error?.message ?? 'ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
        this.deletingId.set(null)
        return EMPTY
      })
    ).subscribe(() => {
      this.deletingId.set(null)
      this.next$.next(0)
    })
  }

  // ── filter helpers ───────────────────────────────────────────────────────────
  hasBranch(list: string[], target: string) {
    return list.includes(target)
  }

  onUpdateFilterOptions<K extends keyof TBranchFilterOption>(key: K, value: TBranchFilterOption[K]) {
    this.filterOptions.update(opts => ({ ...opts, [key]: value }))
  }

  toggleFilter<K extends keyof Omit<TBranchFilterOption, 'branchName'>>(checked: boolean, key: K, code: string) {
    this.filterOptions.update(prev => ({
      ...prev,
      [key]: checked ? [...prev[key], code] : prev[key].filter((v: string) => v !== code)
    }))
  }
}

type TBranchFilterOption = {
  branchName: string
  branchGroupCode: string[]
  branchZoneCode: string[]
  branchPrice: string[]
}
