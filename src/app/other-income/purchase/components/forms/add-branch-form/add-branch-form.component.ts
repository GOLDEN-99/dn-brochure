import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TAddBranchReq, TBranchSearchResult } from '../../../../shared/types/other-income.type';
import { AddBranchForm, addBranchSchema } from './add-branch-form';
import { NgbCalendar, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { form, FormField } from '@angular/forms/signals';
import { SignalDatepickerComponent } from '../../../../../components/crm-promotion/signal-datepicker.component';
import { FormAlertTextComponent } from '../../../../../components/crm-promotion/form-alert-text.component';
import { OtherIncomePurchaseApiService } from '../../../services/other-income-purchase-api.service';
import { debounceTime, Observable, switchMap } from 'rxjs';

@Component({
  selector: 'other-income-add-branch-form',
  imports: [FormField, SignalDatepickerComponent, FormAlertTextComponent, NgbTypeahead],
  templateUrl: './add-branch-form.component.html',
  styles: '',
})
export class AddBranchFormComponent {
  contractId = input.required<number>()
  submitting = input(false)

  private readonly api = inject(OtherIncomePurchaseApiService)
  private readonly calService = inject(NgbCalendar)
  private readonly today = this.calService.getToday()

  private readonly addBranchState = signal<AddBranchForm>({
    branchCode: '',
    branchName: '',
    openDate: this.today,
  })

  addBranchForm = form(this.addBranchState, addBranchSchema)

  submitAddBranch = output<TAddBranchReq>()

  canSubmit = computed(() => this.addBranchForm().valid() && !this.submitting())

  searchBranch = (term$: Observable<string>): Observable<TBranchSearchResult[]> => term$.pipe(
    debounceTime(300),
    switchMap(term => this.api.searchBranches(term)),
  )

  formatBranch = (branch: TBranchSearchResult) => `${branch.branchCode} - ${branch.branchName}`

  onSelectBranch({ item }: NgbTypeaheadSelectItemEvent<TBranchSearchResult>): void {
    this.addBranchState.update(s => ({ ...s, branchCode: item.branchCode, branchName: item.branchName }))
  }

  clearBranch(): void {
    this.addBranchState.update(s => ({ ...s, branchCode: '', branchName: '' }))
  }

  onSubmit(): void {
    if (!this.canSubmit()) return
    const { branchCode, openDate: { year, month, day } } = this.addBranchState()
    this.submitAddBranch.emit({
      branchCode,
      openDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    })
  }

  reset(): void {
    this.addBranchState.set({
      branchCode: '',
      branchName: '',
      openDate: this.today,
    })
  }
}
