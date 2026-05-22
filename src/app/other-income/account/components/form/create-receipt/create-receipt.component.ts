import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { TCreateReceiptForm } from './createReceiptForm.type';
import { SignalDatepickerComponent } from "../../../../../components/crm-promotion/signal-datepicker.component";
import { TOtherIncomeInvoice } from '../../../../shared/types/other-income.type';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { NgbCalendar, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { createReceiptSchema, defaultCreateReceipt } from './createReceiptForm';
import { OtherIncomeAccountPeriodService } from '../../../services/other-income-account-period.service';
import { ngbDateToIso } from '../../../../shared/libs/date-time';
import { FormErrorTextComponent } from "../../../../../shared/components/form-error-text/form-error-text.component";

@Component({
  selector: 'other-income-create-receipt',
  imports: [SignalDatepickerComponent, FormField, NgbTypeahead, FormsModule, FormErrorTextComponent],
  templateUrl: './create-receipt.component.html',
  styles: '',
})
export class CreateReceiptComponent {
  closeModal = output<void>()
  success = output<any>()
  fail = output<any>()
  submitting = signal(false)
  private readonly calendar = inject(NgbCalendar)
  private readonly accountPeriodService = inject(OtherIncomeAccountPeriodService)
  invoiceList = input.required<TOtherIncomeInvoice[]>();
  periodId = input.required<number>()
  totalInvoice = input(0)
  remainingInvoice = input(0)


  private readonly formData = linkedSignal<TCreateReceiptForm>(() => {
    const remaining = this.remainingInvoice()
    const receDate = this.calendar.getToday()
    return { ...defaultCreateReceipt, receDate, remainingInvoice: remaining, receAmount: String(remaining) }
  })

  createForm = form(this.formData, createReceiptSchema)

  formatInvoice = ({ invNumb }: TOtherIncomeInvoice) => invNumb
  searchInvoice = (term$: Observable<string>) => {
    return term$.pipe(
      distinctUntilChanged(),
      map(t => {
        const normalize = t.toLocaleLowerCase().trim()
        return this.invoiceList().filter(({ invNumb, remainingAmount }) => remainingAmount > 0 && invNumb.toLocaleLowerCase().includes(normalize))
      })
    )
  }
  onSelectInvoice({ item }: NgbTypeaheadSelectItemEvent<TOtherIncomeInvoice>) {
    this.createForm.matches().controlValue.update(prev => [...prev, { invoice: item, matchAmount: String(item.remainingAmount) }])
  }

  onSubmit() {
    this.submitting.set(true)
    const formState = this.createForm()
    if (formState.invalid()) {
      this.submitting.set(false)
      this.fail.emit(formState.errorSummary());
      return
    }
    const { receNumb, receAmount, receRemark, receDate, matches } = formState.value();
    this.accountPeriodService.insertRece(this.periodId(), {
      receNumb,
      receDate: ngbDateToIso(receDate),
      receRemark,
      receAmount: Number.parseFloat(receAmount),
      invoiceMatches: matches.map(({ invoice, matchAmount }) => ({ invoiceId: invoice.id, matchedAmount: Number.parseFloat(matchAmount) }))
    }).subscribe({
      next: () => {
        this.submitting.set(false)
        this.success.emit('ok')
        this.closeModal.emit()
      },
      error: (err) => {
        this.submitting.set(false)
        this.fail.emit(err)
      }
    })
  }

  cannotSubmit = computed(() => this.createForm().invalid() || this.submitting())
}
