import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { OtherIncomeAccountPeriodService } from '../../../services/other-income-account-period.service';
import { TCreateCreditNoteForm } from './createCreditNote.type';
import { createCreditNoteSchema, defaultCreditNote } from './createCrediteNote';
import { form, FormField } from '@angular/forms/signals';
import { ngbDateToIso } from '../../../../shared/libs/date-time';
import { SignalDatepickerComponent } from "../../../../../components/crm-promotion/signal-datepicker.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'other-income-create-credit-note',
  imports: [SignalDatepickerComponent, FormField, FormsModule],
  templateUrl: './create-credit-note.component.html',
  styles: '',
})
export class CreateCreditNoteComponent {
  closeModal = output<void>()
  success = output<string>()
  fail = output<string>()
  submitting = signal(false)
  private readonly calendar = inject(NgbCalendar)
  private readonly accountPeriodService = inject(OtherIncomeAccountPeriodService)
  periodId = input.required<number>()
  totalIncome = input(0)
  remainingIncome = input(0)

  private readonly formData = linkedSignal<TCreateCreditNoteForm>(() => {
    const remaining = this.remainingIncome()
    const creditDate = this.calendar.getToday()
    return { ...defaultCreditNote, creditDate, remainingIncome: remaining, creditAmount: String(remaining) }
  })

  createForm = form(this.formData, createCreditNoteSchema)

  onSubmit() {
    this.submitting.set(true)
    const formState = this.createForm()
    if (formState.invalid()) {
      this.submitting.set(false)
      this.fail.emit(formState.errorSummary().map(({ message }) => message).join('\n'));
      return
    }
    const { creditNumb, creditAmount, creditRemark, creditDate } = formState.value();
    this.accountPeriodService.insertCredit(this.periodId(), {
      creditNumb,
      creditDate: ngbDateToIso(creditDate),
      creditRemark,
      creditAmount: Number.parseFloat(creditAmount),
    }).subscribe({
      next: () => {
        this.submitting.set(false)
        this.success.emit('ok');
        this.closeModal.emit();
      },
      error: (err) => {
        this.submitting.set(false)
        this.fail.emit(err)
      }
    })
  }

  cannotSubmit = computed(() => this.createForm().invalid() || this.submitting())
}
