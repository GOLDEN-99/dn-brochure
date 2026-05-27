import { Component, input } from '@angular/core';
import { OtherIncomeEventSelectComponent } from "../../../../shared/components/other-income-event-select/other-income-event-select.component";
import { SelectComponent } from "../../../../../shared/components/select/select.component";
import { OptionComponent } from "../../../../../shared/components/select/option.component";
import { SignalDatepickerComponent } from "../../../../../components/crm-promotion/signal-datepicker.component";
import { FieldTree, FormField } from '@angular/forms/signals';
import { TOtherIncomeEvent } from '../../../../shared/types/other-income.type';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'other-income-create-pair-head',
  imports: [FormField, OtherIncomeEventSelectComponent, SelectComponent, OptionComponent, SignalDatepickerComponent],
  templateUrl: './create-pair-head.component.html',
  styles: '',
})
export class CreatePairHeadComponent {
  periodList = [1, 2, 3, 6, 12].map(period => ({ period, periodName: `${period} เดือน` }))

  headForm = input.required<FieldTree<TOtherIncomeHeadFormState>>()
}
type TOtherIncomePeriod = { period: number, periodName: string }

type TOtherIncomeHeadFormState = {
  displayName: string
  period: TOtherIncomePeriod | null
  event: TOtherIncomeEvent | null
  dateRange: TDateRangeFormState
}

type TDateRangeFormState = {
  startDate: NgbDateStruct,
  endDate: NgbDateStruct
}