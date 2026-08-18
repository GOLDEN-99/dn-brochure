import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { SignalDatepickerComponent } from '../../../crm-promotion/signal-datepicker.component';
import { form, FormField, readonly, required, schema, validate } from '@angular/forms/signals';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { PeriodService } from '../../../../service/other-income/period.service';
import { FormsModule } from '@angular/forms';

type TCreateInvoiceForm = {
  remainingIncome: number
  invNumb: string
  invAmount: string
  invRemark: string
  invDate: NgbDateStruct
}

const defaultInvoice: Omit<TCreateInvoiceForm, 'invDate' | 'remainingIncome'> = {
  invAmount: '0',
  invNumb: '',
  invRemark: ''
}

const createInvoiceSchema = schema<TCreateInvoiceForm>((schema) => {
  required(schema.invNumb, { message: 'กรุณาใส่เลขที่ใบแจ้งหนี้' })
  required(schema.invAmount, { message: 'กรุณากรอกตัวเลข' })
  readonly(schema.remainingIncome)
  validate(schema.invAmount, ({ value }) => {
    const parsed = Number.parseFloat(value())
    if (Number.isNaN(parsed)) return { kind: 'invalid-numeric', message: 'กรุณากรอกตัวเลข' }
    if (parsed <= 0) return { kind: 'invalid-amount', message: 'กรุณากรอกตัวเลขมากกว่า 0' }
    return null
  })
  validate(schema.invAmount, ({ value, valueOf }) => {
    const parsed = Number.parseFloat(value())
    if (Number.isNaN(parsed)) return null
    return parsed > valueOf(schema.remainingIncome) ? { kind: 'max', message: 'ยอดใบแจ้งหนี้มากกว่ารายได้' } : null
  })
})

@Component({
  selector: 'app-other-income-create-invoice',
  imports: [SignalDatepickerComponent, FormField, FormsModule],
  templateUrl: './other-income-create-invoice.component.html',
  styles: '',
})
export class OtherIncomeCreateInvoiceComponent {
  closeModal = output<void>()
  success = output<any>()
  fail = output<any>()
  submitting = signal(false)
  private readonly calendar = inject(NgbCalendar)
  private readonly periodService = inject(PeriodService)
  periodId = input.required<number>()
  totalIncome = input(0)
  remainingIncome = input(0)

  private readonly formData = linkedSignal<TCreateInvoiceForm>(() => {
    const remaining = this.remainingIncome()
    const invDate = this.calendar.getToday()
    return { ...defaultInvoice, invDate, remainingIncome: remaining, invAmount: String(remaining) }
  })

  createForm = form(this.formData, createInvoiceSchema)

  onSubmit() {
    this.submitting.set(true)
    const formState = this.createForm()
    if (formState.invalid()) {
      this.submitting.set(false)
      this.fail.emit(formState.errorSummary());
      return
    }
    const { invNumb, invAmount, invRemark, invDate } = formState.value();
    const { year, month, day } = invDate
    this.periodService.insertInv(this.periodId(), {
      invNumb,
      invDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      invRemark,
      invAmount: Number.parseFloat(invAmount),
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
