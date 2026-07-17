import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TContractHeadForm } from '../create-schema';
import { OtherIncomeEventSelectComponent } from '../../../../shared/components/other-income-event-select/other-income-event-select.component';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { OptionComponent } from '../../../../../shared/components/select/option.component';
import { SignalDatepickerComponent } from '../../../../../components/crm-promotion/signal-datepicker.component';
import { TContractLabelType } from '../../../../shared/types/other-income.type';

@Component({
  selector: 'other-income-create-single-head',
  imports: [FormField, OtherIncomeEventSelectComponent, SelectComponent, OptionComponent, SignalDatepickerComponent],
  templateUrl: './create-single-head.component.html',
  styles: '',
})
export class CreateSingleHeadComponent {
  periodList = [1, 3, 6, 12].map(n => ({ value: n, label: `${n} เดือน` }))
  headForm = input.required<FieldTree<TContractHeadForm>>()
  eventType = input.required<TContractLabelType>()
}
