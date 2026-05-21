import { Component, input, signal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TCreateReceiptForm } from './createReceiptForm.type';
import { SignalDatepickerComponent } from "../../../../../components/crm-promotion/signal-datepicker.component";
import { defaultPartialMatch } from './matchingOnCreate';
import { TOtherIncomeInvoice } from '../../../../shared/types/other-income.type';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'other-income-create-receipt',
  imports: [SignalDatepickerComponent, FormField, NgbTypeahead, FormsModule],
  templateUrl: './create-receipt.component.html',
  styleUrl: './create-receipt.component.scss',
})
export class CreateReceiptComponent {
  form = input.required<FieldTree<TCreateReceiptForm>>()

  onAddPartialInvoice() {
    this.form()().controlValue.update(({ matches, ...res }) => ({ ...res, matches: [...matches, defaultPartialMatch] }))
  }

  invoiceList = input.required<TOtherIncomeInvoice[]>();
  formatInvoice = ({ invNumb }: TOtherIncomeInvoice) => invNumb
  selectedInvoice = signal<TOtherIncomeInvoice | null>(null)
  searchInvoice = (term$: Observable<string>) => {
    return term$.pipe(
      distinctUntilChanged(),
      //debounceTime(300),
      map(t => {
        const normalize = t.toLocaleLowerCase().trim()
        return this.invoiceList().filter(({ invNumb }) => invNumb.toLocaleLowerCase().includes(normalize))
      })
    )
  }
}
