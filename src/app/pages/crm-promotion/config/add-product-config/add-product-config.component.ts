import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTypeaheadModule, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductGroupConfigService } from '../../../../service/crm-promotion/product-group-config.service';
import { TProductCate, TProductType, TProductGroup } from '../../../../types/crm-promotion.type';

@Component({
  selector: 'app-add-product-config',
  imports: [FormsModule, NgbTypeaheadModule, RouterLink],
  templateUrl: './add-product-config.component.html',
  styleUrl: './add-product-config.component.scss'
})
export class AddProductConfigComponent {
  private readonly groupConfig = inject(ProductGroupConfigService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  constructor() {
    this.groupConfig.loadAllProducts()
  }

  // ── reference data ───────────────────────────────────────────────────────────
  readonly allProductCate = this.groupConfig.allProductCate
  readonly allProductType = this.groupConfig.allProductType
  readonly allProductGroup = this.groupConfig.allProductGroup

  // ── typeahead input models ───────────────────────────────────────────────────
  cateInput = signal('')
  typeInput = signal('')
  groupInput = signal('')
  compNameInput = signal('')

  // ── filter state ─────────────────────────────────────────────────────────────
  filterOptions = signal<TFilterOption>({
    compName: '',
    productCate: [],
    productType: [],
    productGroup: [],
  })

  // ── typeahead search functions ───────────────────────────────────────────────
  searchCate = (text$: Observable<string>): Observable<TProductCate[]> =>
    text$.pipe(map(term =>
      this.allProductCate()
        .filter(c => !this.filterOptions().productCate.includes(c.cateCode))
        .filter(c => c.cateDesc.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 10)
    ))

  searchType = (text$: Observable<string>): Observable<TProductType[]> =>
    text$.pipe(map(term =>
      this.allProductType()
        .filter(t => !this.filterOptions().productType.includes(t.typeCode))
        .filter(t => t.typeDesc.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 10)
    ))

  searchGroup = (text$: Observable<string>): Observable<TProductGroup[]> =>
    text$.pipe(map(term =>
      this.allProductGroup()
        .filter(g => !this.filterOptions().productGroup.includes(g.groupCode))
        .filter(g => g.groupDesc.toLowerCase().includes(term.toLowerCase()))
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

  addTag<K extends keyof Omit<TFilterOption, 'compName'>>(key: K, code: string) {
    this.filterOptions.update(prev => ({ ...prev, [key]: [...prev[key], code] }))
  }

  removeTag<K extends keyof Omit<TFilterOption, 'compName'>>(key: K, code: string) {
    this.filterOptions.update(prev => ({ ...prev, [key]: prev[key].filter(v => v !== code) }))
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
    const { compName, productCate, productType, productGroup } = this.filterOptions()
    const currentSet = this.groupConfig.currentProductSet()
    const compLower = compName.toLowerCase()
    const col = this.sortCol()
    const dir = this.sortDir()

    const filtered = this.groupConfig.allProducts()
      .filter(p => !currentSet.has(p.goodCode))
      .filter(p => !compLower || p.compName.toLowerCase().includes(compLower) || p.compName2.toLowerCase().includes(compLower))
      .filter(p => productCate.length === 0 || productCate.includes(p.cateCode))
      .filter(p => productType.length === 0 || productType.includes(p.typeCode))
      .filter(p => productGroup.length === 0 || productGroup.includes(p.groupCode))

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

  confirmAdd() {
    const codes = [...this.selectedCodes()]
    if (codes.length === 0) return
    this.saving.set(true)
    this.groupConfig.addProducts(codes).subscribe(() => {
      this.saving.set(false)
      this.router.navigate(['..'], { relativeTo: this.route })
    })
  }
}

type TFilterOption = {
  compName: string
  productCate: string[]
  productType: string[]
  productGroup: string[]
}
