import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { PeriodService } from '../../../../service/other-income/period.service';
import { form, FormField, readonly, required, schema, validate } from '@angular/forms/signals';
import { SignalDatepickerComponent } from '../../../crm-promotion/signal-datepicker.component';
import { FormsModule } from '@angular/forms';

type TCreateCreditNoteForm = {
  remainingIncome: number
  creditNumb: string
  creditAmount: string
  creditRemark: string
  creditDate: NgbDateStruct
}

const defaultCreditNote: Omit<TCreateCreditNoteForm, 'creditDate' | 'remainingIncome'> = {
  creditAmount: '0',
  creditNumb: '',
  creditRemark: ''
}

const createCreditNoteSchema = schema<TCreateCreditNoteForm>((schema) => {
  required(schema.creditNumb, { message: 'กรุณาใส่เลขที่ใบลดหนี้' })
  required(schema.creditAmount, { message: 'กรุณากรอกตัวเลข' })
  readonly(schema.remainingIncome)
  validate(schema.creditAmount, ({ value }) => {
    const parsed = Number.parseFloat(value())
    if (Number.isNaN(parsed)) return { kind: 'invalid-numeric', message: 'กรุณากรอกตัวเลข' }
    if (parsed <= 0) return { kind: 'invalid-amount', message: 'กรุณากรอกตัวเลขมากกว่า 0' }
    return null
  })
  validate(schema.creditAmount, ({ value, valueOf }) => {
    const parsed = Number.parseFloat(value())
    if (Number.isNaN(parsed)) return null
    return parsed > valueOf(schema.remainingIncome) ? { kind: 'max', message: 'ยอดใบลดหนี้มากกว่ารายได้' } : null
  })
})

@Component({
  selector: 'app-other-income-create-credit-note',
  imports: [SignalDatepickerComponent, FormField, FormsModule],
  templateUrl: './other-income-create-credit-note.component.html',
  styles: '',
})
export class OtherIncomeCreateCreditNoteComponent {
  closeModal = output<void>()
  success = output<string>()
  fail = output<string>()
  submitting = signal(false)
  private readonly calendar = inject(NgbCalendar)
  private readonly periodService = inject(PeriodService)
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
    const { year, month, day } = creditDate
    this.periodService.insertCredit(this.periodId(), {
      creditNumb,
      creditDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
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
