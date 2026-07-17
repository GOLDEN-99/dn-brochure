import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTypeaheadModule, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, EMPTY, BehaviorSubject, combineLatest } from 'rxjs';
import { map, catchError, filter, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ProductConfigService } from '../../../../../service/crm-promotion/product-config.service';
import { ProductGroupConfigService } from '../../../../../service/crm-promotion/product-group-config.service';
import { TProductCate, TProductGroup, TProductType } from '../../../../../types/crm-promotion.type';

@Component({
  selector: 'app-add-product-config',
  imports: [FormsModule, NgbTypeaheadModule, RouterLink],
  templateUrl: './add-product-config.component.html',
  styles: ''
})
export class AddProductConfigComponent {
  private readonly productConfig = inject(ProductConfigService)
  productGroupId = input<number>()
  private readonly next$ = new BehaviorSubject(0)
  private readonly productGroupId$ = toObservable(this.productGroupId)
  private readonly currentProductInGroup$ = combineLatest({
    next: this.next$,
    productGroupId: this.productGroupId$
  })
    .pipe(
      map(({ productGroupId: id }) => Number(id)),
      filter(maybeNan => !Number.isNaN(maybeNan)),
      switchMap(id => this.productConfig.getAllProductGroup(id))
    )

  readonly currentProductInGroup = toSignal(this.currentProductInGroup$, { initialValue: [] })
  readonly currentProductSet = computed(() =>
    new Set(this.currentProductInGroup().map(p => p.goodCode))
  )
  private readonly groupConfig = inject(ProductGroupConfigService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)



  // ── reference data ───────────────────────────────────────────────────────────
  readonly allProductCate = this.groupConfig.allProductCate
  readonly validCategory = computed(() => this.allProductCate()
    .filter(c => !this.filterOptions().productCate.includes(c.cateCode))
  )
  readonly allProductType = this.groupConfig.allProductType
  readonly validType = computed(() => this.allProductType()
    .filter(t => !this.filterOptions().productType.includes(t.typeCode))
  )
  readonly allProductGroup = this.groupConfig.allProductGroup
  readonly validGroup = computed(() => this.allProductGroup()
    .filter(g => !this.filterOptions().productGroup.includes(g.groupCode))


  )

  // ── typeahead input models ───────────────────────────────────────────────────
  cateInput = signal('')
  typeInput = signal('')
  groupInput = signal('')

  // ── filter state ─────────────────────────────────────────────────────────────
  filterOptions = signal<TFilterOption>({
    compName: '',
    goodName: '',
    productCate: [],
    productType: [],
    productGroup: [],
  })

  // ── typeahead search functions ───────────────────────────────────────────────
  searchCate = (text$: Observable<string>): Observable<TProductCate[]> =>
    text$.pipe(map(term =>
      this.validCategory()
        .filter(c => c.cateDesc.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 10)
    ))

  searchType = (text$: Observable<string>): Observable<TProductType[]> =>
    text$.pipe(map(term =>
      this.validType()
        .filter(t => t.typeDesc.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 10)
    ))

  searchGroup = (text$: Observable<string>): Observable<TProductGroup[]> =>
    text$.pipe(map(term =>
      this.validGroup().filter(g => g.groupDesc.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 10)
    ))

  // ── formatters ───────────────────────────────────────────────────────────────
  formatCate = (c: TProductCate) => c.cateDesc
  formatType = (t: TProductType) => t.typeDesc
  formatGroup = (g: TProductGroup) => g.groupDesc

  // ── select handlers ──────────────────────────────────────────────────────────
  onSelectCate(e: NgbTypeaheadSelectItemEvent<TProductCate>) {
    e.preventDefault()
    this.addTag('productCate', e.item.cateCode)
    this.cateInput.set('')
  }

  onSelectType(e: NgbTypeaheadSelectItemEvent<TProductType>) {
    e.preventDefault()
    this.addTag('productType', e.item.typeCode)
    this.typeInput.set('')
  }

  onSelectGroup(e: NgbTypeaheadSelectItemEvent<TProductGroup>) {
    e.preventDefault()
    this.addTag('productGroup', e.item.groupCode)
    this.groupInput.set('')
  }

  // ── tag helpers ──────────────────────────────────────────────────────────────
  getCateDesc(code: string) {
    return this.allProductCate().find(c => c.cateCode === code)?.cateDesc ?? code
  }
  getTypeDesc(code: string) {
    return this.allProductType().find(t => t.typeCode === code)?.typeDesc ?? code
  }
  getGroupDesc(code: string) {
    return this.allProductGroup().find(g => g.groupCode === code)?.groupDesc ?? code
  }

  setCompName(value: string) {
    this.filterOptions.update(o => ({ ...o, compName: value }))
  }

  setGoodName(value: string) {
    this.filterOptions.update(o => ({ ...o, goodName: value }))
  }

  addTag<K extends keyof Omit<TFilterOption, 'compName' | 'goodName'>>(key: K, code: string) {
    this.filterOptions.update(prev => ({ ...prev, [key]: [...prev[key], code] }))
  }

  removeTag<K extends keyof Omit<TFilterOption, 'compName' | 'goodName'>>(key: K, code: string) {
    this.filterOptions.update(prev => ({ ...prev, [key]: prev[key].filter((v: string) => v !== code) }))
  }

  // ── sort state ───────────────────────────────────────────────────────────────
  sortCol = signal<'sku' | 'goodName' | 'compName' | 'cateDesc' | null>(null)
  sortDir = signal<'asc' | 'desc'>('asc')

  toggleSort(col: 'sku' | 'goodName' | 'compName' | 'cateDesc') {
    if (this.sortCol() === col) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      this.sortCol.set(col)
      this.sortDir.set('asc')
    }
  }

  // ── filtered product list ────────────────────────────────────────────────────
  filteredProducts = computed(() => {
    const { compName, goodName, productCate, productType, productGroup } = this.filterOptions()
    const currentSet = this.currentProductSet()
    const compLower = compName.toLowerCase()
    const goodLower = goodName.toLowerCase()
    const col = this.sortCol()
    const dir = this.sortDir()

    const filtered = this.groupConfig.allProducts()
      .filter(p => !currentSet.has(p.goodCode))
      .filter(p => !compLower || p.compName.toLowerCase().includes(compLower) || (p.compName2 ?? '').toLowerCase().includes(compLower))
      .filter(p => !goodLower || p.goodName.toLowerCase().includes(goodLower))
      .filter(p => productCate.length === 0 || productCate.includes(p.cateCode))
      .filter(p => productType.length === 0 || productType.includes(p.typeCode))
      .filter(p => productGroup.length === 0 || productGroup.includes(p.goodGroupCode))

    if (!col) return filtered

    return [...filtered].sort((a, b) => {
      const cmp = (a[col] ?? '').localeCompare(b[col] ?? '', 'th')
      return dir === 'asc' ? cmp : -cmp
    })
  })

  // ── selection ────────────────────────────────────────────────────────────────
  selectedCodes = signal<Set<string>>(new Set())

  isSelected(code: string) { return this.selectedCodes().has(code) }

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
    const codes = [...this.selectedCodes()]
    if (codes.length === 0) return
    this.saving.set(true)
    this.saveError.set(null)
    this.groupConfig.addProducts(this.productGroupId(), codes).pipe(
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
}

type TFilterOption = {
  compName: string
  goodName: string
  productCate: string[]
  productType: string[]
  productGroup: string[]
}
