import { Component, computed, ElementRef, inject, input, model, ModelSignal, signal, viewChild } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { OtherIncomeSearchProductService } from '../../../services/other-income-search-product.service';
import { TOtherIncomeCompType } from '../../../../shared/types/other-income.type';

@Component({
  selector: 'other-income-create-product-picker',
  imports: [FormsModule],
  templateUrl: './create-product-picker.component.html',
  styles: '',
  providers: [OtherIncomeSearchProductService],
})
export class CreateProductPickerComponent implements FormValueControl<TOtherIncomeProduct[]> {
  private readonly productService = inject(OtherIncomeSearchProductService)
  private readonly modalService = inject(NgbModal)

  compCode = input.required<string>()
  compType = input.required<TOtherIncomeCompType>()

  value: ModelSignal<TOtherIncomeProduct[]> = model<TOtherIncomeProduct[]>([])
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([])
  disabled = input(false)
  touched = model(false)

  productModal = viewChild<unknown>('productModal')
  openButtonRef = viewChild<ElementRef<HTMLButtonElement>>('openButton')
  focus(options?: FocusOptions): void { this.openButtonRef()?.nativeElement.focus(options) }

  private readonly compCode$ = toObservable(this.compCode)
  private readonly product$ = this.compCode$.pipe(
    switchMap(compCode => {
      if (compCode === '') return of([])
      return this.compType() === 'dn'
        ? this.productService.searchDNProduct(compCode)
        : this.productService.searchHUProduct(compCode)
    })
  )
  private readonly rawResult = toSignal(this.product$, { initialValue: [] })

  pendingSelection = signal<TOtherIncomeProduct[]>([])

  searchResult = computed(() => {
    const selected = new Set(this.pendingSelection().map(p => p.goodCode))
    return this.rawResult().map(p => ({
      ...p,
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
    const raw = this.rawResult().find(p => p.goodCode === goodCode)
    if (!raw) return
    const exists = this.pendingSelection().some(p => p.goodCode === goodCode)
    this.pendingSelection.update(prev =>
      exists ? prev.filter(p => p.goodCode !== goodCode) : [...prev, raw]
    )
  }

  selectAll(checked: boolean) {
    if (checked) {
      const toAdd = this.rawResult()
      const existing = new Set(this.pendingSelection().map(p => p.goodCode))
      this.pendingSelection.update(prev => [
        ...prev,
        ...toAdd.filter(p => !existing.has(p.goodCode)),
      ])
    } else {
      const resultCodes = new Set(this.rawResult().map(p => p.goodCode))
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
