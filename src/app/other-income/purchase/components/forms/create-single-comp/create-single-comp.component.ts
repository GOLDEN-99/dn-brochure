import { Component, computed, inject, input, model, signal } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { OtherIncomeSearchCompService } from '../../../services/other-income-search-comp.service';
import { TOtherIncomeComp, TOtherIncomeCompanyForm } from '../create-schema';
import { TOtherIncomeCompanyRes } from '../../../../shared/types/other-income.type';
import { CompType } from '../../../../shared/libs/other-income-schema';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, Observable, switchMap, tap } from 'rxjs';
import { OtherIncomeSearchProductService, TSearchProductResult } from '../../../services/other-income-search-product.service';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

const DEFAULT_COMP: TOtherIncomeComp = { compCode: '', compName: '', compName2: '' }

@Component({
  selector: 'other-income-create-single-comp',
  imports: [FormsModule, NgbTypeahead],
  templateUrl: './create-single-comp.component.html',
  styles: '',
  providers: [OtherIncomeSearchCompService],
})
export class CreateSingleCompComponent implements FormValueControl<TOtherIncomeCompanyForm> {
  value = model<TOtherIncomeCompanyForm>({
    comp: { compCode: '', compName: '', compName2: '' },
    products: []
  })
  compType = input.required<CompType>()
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([])
  disabled = input(false)
  touched = model(false)
  focus(): void { }

  productRef = computed(() => {
    const product = this.value().products
    return new Set(product.map(({ goodCode }) => goodCode))
  })

  private readonly searchService = inject(OtherIncomeSearchCompService)
  private readonly searchProductService = inject(OtherIncomeSearchProductService)


  searchTerm = signal('')
  queryComp = computed(() => {
    const term = this.searchTerm();
    const compType = this.compType()
    return [compType, term] satisfies [CompType, string]
  })
  private readonly queryComp$ = toObservable(this.queryComp)
  private readonly compResult$ = this.queryComp$.pipe(switchMap((q) => this.searchService.searchComp(...q)))
  compResult = toSignal(this.compResult$, { initialValue: [] })
  handleTypeCompName = (term$: Observable<string>) => term$.pipe(
    debounceTime(300),
    tap(console.log),
    switchMap(term => this.searchService.searchComp(this.compType(), term))
  )

  formatComp({ compCode, compName }: TOtherIncomeComp) {
    return `${compCode} - ${compName}`
  }
  handleSelectComp({ item: comp }: NgbTypeaheadSelectItemEvent<TOtherIncomeCompanyRes>) {
    this.value.update(((_) => ({ comp, products: [] })))
  }

  queryProduct = computed(() => {
    const compType = this.compType();
    const compCode = this.value().comp.compCode
    return { compType, compCode }
  })
  private readonly queryProduct$ = toObservable(this.queryProduct)
  private readonly product$ = this.queryProduct$.pipe(
    filter(q => q.compCode !== ''),
    distinctUntilChanged((a, b) => a.compType === b.compType && a.compCode === b.compCode),
    switchMap((q) => this.searchProductService.searchProduct(q))
  )
  product = toSignal(this.product$, { initialValue: [] })
  validProduct = computed(() => {
    const ref = this.productRef()
    return this.product().filter(({ goodCode }) => !ref.has(goodCode))
  })



  onSearchInput(term: string) {
    this.searchTerm.set(term)
  }

  selectComp(company: TOtherIncomeCompanyRes) {
    this.touched.set(true)
    this.value.update(
      ({ comp, products }) => comp.compCode === company.compCode
        ? ({ comp, products })
        : ({ comp: company, products: [] })
    )
  }

  clearComp() {
    this.touched.set(true)
    this.value.update((_) => ({ comp: DEFAULT_COMP, products: [] }))
  }

  addAllItem() {
    this.value.update(({ comp }) => ({ comp, products: [...this.product()] }))
  }

  addProduct(product: TSearchProductResult) {
    this.value.update(({ comp, products }) => ({ comp, products: [...products, product] }))
  }


  clearAllItem() {
    this.value.update(({ comp }) => ({ comp, products: [] }))
  }

  removeProduct(goodCode: string) {
    this.value.update(({ comp, products }) => ({ comp, products: products.filter(p => p.goodCode !== goodCode) }))
  }
}
