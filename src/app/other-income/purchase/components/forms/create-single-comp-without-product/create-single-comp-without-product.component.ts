import { Component, computed, inject, input, model, signal } from '@angular/core';
import { FormValueControl, } from '@angular/forms/signals';
import { TOtherIncomeComp } from '../create-schema';
import { CompType } from '../../../../shared/libs/other-income-schema';
import { OtherIncomeSearchCompService } from '../../../services/other-income-search-comp.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, Observable, switchMap } from 'rxjs';
import { NgbTypeaheadSelectItemEvent, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { TOtherIncomeCompanyRes } from '../../../../shared/types/other-income.type';

const DEFAULT_COMP: TOtherIncomeComp = { compCode: '', compName: '', compName2: '' }

@Component({
  selector: 'other-income-create-single-comp-without-product',
  imports: [NgbTypeahead],
  templateUrl: './create-single-comp-without-product.component.html',
  styleUrl: './create-single-comp-without-product.component.scss',
})
export class CreateSingleCompWithoutProductComponent implements FormValueControl<TOtherIncomeComp> {
  value = model<TOtherIncomeComp>(DEFAULT_COMP)
  compType = input.required<CompType>()

  disabled = input(false)
  touched = model(false)
  focus(): void { }

  private readonly searchService = inject(OtherIncomeSearchCompService)


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
    switchMap(term => this.searchService.searchComp(this.compType(), term))
  )

  formatComp({ compCode, compName }: TOtherIncomeComp) {
    return `${compCode} - ${compName}`
  }
  handleSelectComp({ item: comp }: NgbTypeaheadSelectItemEvent<TOtherIncomeCompanyRes>) {
    this.value.update(((_) => comp))
  }
  clearComp() {
    this.value.set(DEFAULT_COMP)
  }
}
