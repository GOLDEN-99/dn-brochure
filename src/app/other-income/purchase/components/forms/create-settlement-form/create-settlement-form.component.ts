import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TIncomeEntry, TPostSettlementReq } from '../../../../shared/types/other-income.type';
import { CreateSettlementForm, createSettlementSchema } from './create-settlement-form';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { SignalDatepickerComponent } from '../../../../../components/crm-promotion/signal-datepicker.component';
import { FormAlertTextComponent } from '../../../../../components/crm-promotion/form-alert-text.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'other-income-create-settlement-form',
  imports: [FormField, SignalDatepickerComponent, FormAlertTextComponent, DatePipe],
  templateUrl: './create-settlement-form.component.html',
  styles: '',
})
export class CreateSettlementFormComponent {
  contractId = input.required<number>()
  contractType = input.required<'ORDER' | 'BRANCH' | 'PROMO'>()
  openEntries = input.required<TIncomeEntry[]>()
  submitting = input(false)

  private readonly calService = inject(NgbCalendar)
  private readonly today = this.calService.getToday()

  private readonly createSettlementState = signal<CreateSettlementForm>({
    periodName: '',
    dateRange: { startDate: this.today, endDate: this.today },
    remark: '',
  })

  createSettlementForm = form(this.createSettlementState, createSettlementSchema)

  submitSettlement = output<TPostSettlementReq>()

  selectedEntryIds = signal<Set<number>>(new Set())

  canSubmit = computed(() => this.createSettlementForm().valid() && this.selectedEntryIds().size > 0 && !this.submitting())

  showSupplierOrderAmount = computed(() => this.contractType() === 'ORDER')

  supplierOrderAmount = computed(() => {
    const ids = this.selectedEntryIds()
    return this.openEntries()
      .filter(e => ids.has(e.id))
      .reduce((sum, e) => sum + (e.orderAmount ?? 0), 0)
  })

  toggleEntry(id: number): void {
    this.selectedEntryIds.update(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  onSubmit(): void {
    if (!this.canSubmit()) return
    const { periodName, dateRange, remark } = this.createSettlementState()
    const { startDate, endDate } = dateRange
    const toIso = ({ year, month, day }: typeof startDate) => `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    this.submitSettlement.emit({
      contractId: this.contractId(),
      contractType: this.contractType(),
      periodName,
      startDate: toIso(startDate),
      endDate: toIso(endDate),
      supplierOrderAmount: this.showSupplierOrderAmount() ? this.supplierOrderAmount() : undefined,
      incomeEntryIds: [...this.selectedEntryIds()],
      remark: remark || undefined,
    })
  }

  reset(): void {
    this.createSettlementState.set({
      periodName: '',
      dateRange: { startDate: this.today, endDate: this.today },
      remark: '',
    })
    this.selectedEntryIds.set(new Set())
  }
}
