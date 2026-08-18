import { Component, inject, signal } from '@angular/core';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TDateRangeFormState } from '../../../../shared/types/other-income.type';
import {
  createOrderContractSchema,
  TCreateOrderContractForm,
  TOtherIncomeCompWithType,
} from '../../forms/create-schema';
import { OtherIncomeIncomeSelectComponent } from "../../../../shared/components/other-income-income-select/other-income-income-select.component";
import { form } from '@angular/forms/signals';
import { ProductConditionFormComponent } from "../../forms/product-condition-form/product-condition-form.component";
import { StepFormComponent } from "../../forms/step-form/step-form.component";
import { COMP_TYPE } from '../../../../shared/libs/other-income-schema';

@Component({
  selector: 'app-create-order-contract',
  imports: [OtherIncomeIncomeSelectComponent, ProductConditionFormComponent, StepFormComponent],
  templateUrl: './create-order-contract.component.html',
  styles: '',
})
export class CreateOrderContractComponent {
  private readonly calendarService = inject(NgbCalendar)
  startOfYear: NgbDateStruct = {
    ...this.calendarService.getToday(), day: 1, month: 1
  }
  endOfYear: NgbDateStruct = {
    ...this.calendarService.getToday(), day: 31, month: 12
  }
  formData = signal<TCreateOrderContractForm>({
    head: {
      settlementPeriod: null,
      contractLabel: null,
      bill: null, freeItem: null, invoice: null, creditNote: null,
      dateRange: {
        startDate: this.startOfYear,
        endDate: this.endOfYear
      }
    },
    products: [],
    comp: {
      dn: true, dnComp: { compCode: '', compName: '', compName2: '' },
      hu: false, huComp: { compCode: '', compName: '', compName2: '' }
    },
    excludeFlags: {
      excludeDc: false, excludeRebate: false, excludeComp: false, excludeInce: false, excludeVat: false
    },
    calcSpec: {
      cap: {
        isCap: false,
        capAmount: 0
      },
      calcType: null,
      bracketSteps: [
        { min: 0, rate: 0 }
      ],
      singleStep: { min: 0, rate: 0 }
    }
  })

  createForm = form(this.formData, createOrderContractSchema)
}

const handleComp = ({ dn, dnComp, hu, huComp }: TOtherIncomeCompWithType) => {
  if (dn === hu) return null
  if (dn) return { compCode: dnComp.compCode, compType: COMP_TYPE['dn'] }
  if (hu) return { compCode: huComp.compCode, compType: COMP_TYPE['hu'] }
  return null
}
