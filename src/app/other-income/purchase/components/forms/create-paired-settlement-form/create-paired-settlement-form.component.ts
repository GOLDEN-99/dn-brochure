import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TIncomeEntry, TPostPairedSettlementReq } from '../../../../shared/types/other-income.type';
import { CreatePairedSettlementForm, createPairedSettlementSchema } from './create-paired-settlement-form';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { SignalDatepickerComponent } from '../../../../../components/crm-promotion/signal-datepicker.component';
import { FormAlertTextComponent } from '../../../../../components/crm-promotion/form-alert-text.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'other-income-create-paired-settlement-form',
  imports: [FormField, SignalDatepickerComponent, FormAlertTextComponent, DatePipe],
  templateUrl: './create-paired-settlement-form.component.html',
  styles: '',
})
export class CreatePairedSettlementFormComponent {
  dnContractId = input.required<number>()
  huContractId = input.required<number>()
  dnEntries = input.required<TIncomeEntry[]>()
  huEntries = input.required<TIncomeEntry[]>()
  submitting = input(false)

  private readonly calService = inject(NgbCalendar)
  private readonly today = this.calService.getToday()

  private readonly createPairedSettlementState = signal<CreatePairedSettlementForm>({
    periodName: '',
    dateRange: { startDate: this.today, endDate: this.today },
    remark: '',
  })

  createPairedSettlementForm = form(this.createPairedSettlementState, createPairedSettlementSchema)

  submitPairedSettlement = output<TPostPairedSettlementReq>()

  dnOpenEntries = computed(() => this.dnEntries().filter(e => !e.settlementId))
  huOpenEntries = computed(() => this.huEntries().filter(e => !e.settlementId))

  dnSelectedEntryIds = signal<Set<number>>(new Set())
  huSelectedEntryIds = signal<Set<number>>(new Set())

  canSubmit = computed(() =>
    this.createPairedSettlementForm().valid() &&
    (this.dnSelectedEntryIds().size > 0 || this.huSelectedEntryIds().size > 0) &&
    !this.submitting()
  )

  dnSupplierOrderAmount = computed(() => {
    const ids = this.dnSelectedEntryIds()
    return this.dnOpenEntries()
      .filter(e => ids.has(e.id))
      .reduce((sum, e) => sum + (e.orderAmount ?? 0), 0)
  })

  huSupplierOrderAmount = computed(() => {
    const ids = this.huSelectedEntryIds()
    return this.huOpenEntries()
      .filter(e => ids.has(e.id))
      .reduce((sum, e) => sum + (e.orderAmount ?? 0), 0)
  })

  toggleDnEntry(id: number): void {
    this.dnSelectedEntryIds.update(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  toggleHuEntry(id: number): void {
    this.huSelectedEntryIds.update(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  onSubmit(): void {
    if (!this.canSubmit()) return
    const { periodName, dateRange, remark } = this.createPairedSettlementState()
    const { startDate, endDate } = dateRange
    const toIso = ({ year, month, day }: typeof startDate) => `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    this.submitPairedSettlement.emit({
      dnContractId: this.dnContractId(),
      huContractId: this.huContractId(),
      periodName,
      startDate: toIso(startDate),
      endDate: toIso(endDate),
      dnSupplierOrderAmount: this.dnSupplierOrderAmount(),
      huSupplierOrderAmount: this.huSupplierOrderAmount(),
      dnIncomeEntryIds: [...this.dnSelectedEntryIds()],
      huIncomeEntryIds: [...this.huSelectedEntryIds()],
      remark: remark || undefined,
    })
  }

  reset(): void {
    this.createPairedSettlementState.set({
      periodName: '',
      dateRange: { startDate: this.today, endDate: this.today },
      remark: '',
    })
    this.dnSelectedEntryIds.set(new Set())
    this.huSelectedEntryIds.set(new Set())
  }
}
