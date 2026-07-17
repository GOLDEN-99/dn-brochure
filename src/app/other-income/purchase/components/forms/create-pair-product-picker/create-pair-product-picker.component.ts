import { Component, computed, ElementRef, inject, input, model, ModelSignal, signal, viewChild } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { OtherIncomeSearchProductService } from '../../../services/other-income-search-product.service';

@Component({
  selector: 'other-income-create-pair-product-picker',
  imports: [FormsModule],
  templateUrl: './create-pair-product-picker.component.html',
  styles: '',
  providers: [OtherIncomeSearchProductService],
})
export class CreatePairProductPickerComponent implements FormValueControl<TOtherIncomeProduct[]> {
  private readonly productService = inject(OtherIncomeSearchProductService)
  private readonly modalService = inject(NgbModal)

  dnCompCode = input.required<string>()
  huCompCode = input.required<string>()

  value: ModelSignal<TOtherIncomeProduct[]> = model<TOtherIncomeProduct[]>([])
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([])
  disabled = input(false)
  touched = model(false)

  cannotSearch = computed(() => this.dnCompCode() === '' || this.huCompCode() === '' || this.disabled())
  productModal = viewChild<unknown>('productModal')
  openButtonRef = viewChild<ElementRef<HTMLButtonElement>>('openButton')
  focus(options?: FocusOptions): void { this.openButtonRef()?.nativeElement.focus(options) }

  private readonly dnCompCode$ = toObservable(this.dnCompCode)
  private readonly huCompCode$ = toObservable(this.huCompCode)

  private readonly dnProduct$ = this.dnCompCode$.pipe(
    switchMap(compCode => compCode === '' ? of([]) : this.productService.searchDNProduct(compCode))
  )
  private readonly huProduct$ = this.huCompCode$.pipe(
    switchMap(compCode => compCode === '' ? of([]) : this.productService.searchHUProduct(compCode))
  )

  private readonly merged$ = combineLatest([this.dnProduct$, this.huProduct$]).pipe(
    map(([dn, hu]) => {
      const seen = new Set<string>()
      const result: TOtherIncomeProduct[] = []
      for (const p of dn) {
        if (!seen.has(p.goodCode)) { seen.add(p.goodCode); result.push(p) }
      }
      for (const p of hu) {
        if (!seen.has(p.goodCode)) { seen.add(p.goodCode); result.push(p) }
      }
      return result
    })
  )

  private readonly mergedRaw = toSignal(this.merged$, { initialValue: [] })

  pendingSelection = signal<TOtherIncomeProduct[]>([])

  searchResult = computed(() => {
    const selected = new Set(this.pendingSelection().map(p => p.goodCode))
    return this.mergedRaw().map(p => ({
      goodCode: p.goodCode,
      goodName: p.goodName,
      barCode: p.barCode,
      check: selected.has(p.goodCode),
    }))
  })

  isSelectAll = computed(() =>
    this.searchResult().length > 0 && this.searchResult().every(p => p.check)
  )

  openModal() {
    this.pendingSelection.set([...this.value()])
    this.modalService.open(this.productModal())
  }

  toggleProduct(goodCode: string) {
    const raw = this.mergedRaw().find(p => p.goodCode === goodCode)
    if (!raw) return
    const exists = this.pendingSelection().some(p => p.goodCode === goodCode)
    this.pendingSelection.update(prev =>
      exists
        ? prev.filter(p => p.goodCode !== goodCode)
        : [...prev, raw]
    )
  }

  selectAll(checked: boolean) {
    if (checked) {
      const toAdd = this.mergedRaw()
      const existing = new Set(this.pendingSelection().map(p => p.goodCode))
      this.pendingSelection.update(prev => [
        ...prev,
        ...toAdd.filter(p => !existing.has(p.goodCode)),
      ])
    } else {
      const resultCodes = new Set(this.mergedRaw().map(p => p.goodCode))
      this.pendingSelection.update(prev => prev.filter(p => !resultCodes.has(p.goodCode)))
    }
  }

  submit() {
    this.touched.set(true)
    this.value.set(this.pendingSelection())
    this.modalService.dismissAll()
  }

  removeProduct(goodCode: string) {
    this.touched.set(true)
    this.value.update(prev => prev.filter(p => p.goodCode !== goodCode))
  }
}

export type TOtherIncomeProduct = { goodCode: string; goodName: string; barCode: string }
