import { Component, model, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { TOtherIncomeComp } from '../create-schema';
import { TMaybe } from '../../../../../shared/types/index.type';
import { CompType } from '../../../../shared/libs/other-income-schema';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-search-supplier-company',
  imports: [NgbTypeahead],
  templateUrl: './search-supplier-company.component.html',
  styleUrl: './search-supplier-company.component.scss',
})
export class SearchSupplierCompanyComponent implements FormValueControl<TMaybe<TOtherIncomeComp>> {
  value = model<TMaybe<TOtherIncomeComp>>(null);
  compType = signal<CompType>('DN')
  onSearchCompName = (term: Observable<string>): Observable<Array<TOtherIncomeComp>> => {
    return of([{ compCode: 'test', compName: 'test', compName2: 'test name 2' }])
  }
  onSearchCompCode = (term: Observable<string>): Observable<Array<TOtherIncomeComp>> => {
    return of([{ compCode: 'test', compName: 'test', compName2: 'test name 2' }])
  }

  onSelect(event: NgbTypeaheadSelectItemEvent<TOtherIncomeComp>) {
    event.preventDefault();
    this.value.set(event.item);
  }
}
