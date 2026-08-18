import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TPostCreditNoteReq } from '../../../../shared/types/other-income.type';
import { AppendCreditNoteForm, appendCreditNoteSchema } from './append-credit-note';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { SignalDatepickerComponent } from '../../../../../components/crm-promotion/signal-datepicker.component';
import { FormAlertTextComponent } from '../../../../../components/crm-promotion/form-alert-text.component';
import { ngbDateToIso } from '../../../../shared/libs/date-time';

@Component({
  selector: 'other-income-append-credit-note',
  imports: [FormField, SignalDatepickerComponent, FormAlertTextComponent],
  templateUrl: './append-credit-note.component.html',
  styles: '',
})
export class AppendCreditNoteComponent {
  submitting = input(false)

  private readonly calendar = inject(NgbCalendar)
  private readonly today = this.calendar.getToday()

  private readonly appendCreditNoteState = signal<AppendCreditNoteForm>({
    creditNumb: '',
    creditDate: this.today,
    creditAmount: 0,
    creditRemark: '',
  })

  appendCreditNoteForm = form(this.appendCreditNoteState, appendCreditNoteSchema)

  submitCreditNote = output<TPostCreditNoteReq>()

  canSubmit = computed(() => this.appendCreditNoteForm().valid() && !this.submitting())

  onSubmit(): void {
    if (!this.canSubmit()) return
    const { creditNumb, creditDate, creditAmount, creditRemark } = this.appendCreditNoteState()
    this.submitCreditNote.emit({
      creditNumb,
      creditDate: ngbDateToIso(creditDate),
      creditAmount,
      creditRemark,
    })
  }

  reset(): void {
    this.appendCreditNoteState.set({
      creditNumb: '',
      creditDate: this.today,
      creditAmount: 0,
      creditRemark: '',
    })
  }
}
