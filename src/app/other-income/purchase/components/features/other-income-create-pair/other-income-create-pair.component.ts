import { Component, computed, inject, signal } from '@angular/core';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OiNotLightPairService } from '../../../../../service/other-income/oi-not-light-pair.service';
import { form, FormField } from '@angular/forms/signals';
import { StepFormComponent } from "../../forms/step-form/step-form.component";
import { OtherIncomeIncomeSelectComponent } from "../../../../shared/components/other-income-income-select/other-income-income-select.component";
import { JsonPipe } from '@angular/common';
import { CreatePairCompanyPickerComponent } from "../../forms/create-pair-company-picker/create-pair-company-picker.component";
import { CreatePairHeadComponent } from "../../forms/create-pair-head/create-pair-head.component";
import { CreatePairProductPickerComponent } from "../../forms/create-pair-product-picker/create-pair-product-picker.component";
import { ProductConditionFormComponent } from "../../forms/product-condition-form/product-condition-form.component";
import { createPairDcRebatePairSchema, TOtherIncomePairHead } from '../../forms/create-schema';

@Component({
  selector: 'other-income-create-pair',
  imports: [FormField, JsonPipe, StepFormComponent, OtherIncomeIncomeSelectComponent, CreatePairCompanyPickerComponent, CreatePairHeadComponent, CreatePairProductPickerComponent, ProductConditionFormComponent],
  templateUrl: './other-income-create-pair.component.html',
  styles: '',
})
export class OtherIncomeCreatePairComponent {
  private readonly calendarService = inject(NgbCalendar)
  startOfYear: NgbDateStruct = {
    ...this.calendarService.getToday(), day: 1, month: 1
  }
  endOfYear: NgbDateStruct = {
    ...this.calendarService.getToday(), day: 31, month: 12
  }
  formData = signal<TOtherIncomePairHead>({
    head: {
      displayName: "",
      period: null,
      event: null,
      dateRange: {
        startDate: this.startOfYear,
        endDate: this.endOfYear
      }
    },
    products: [],
    comps: {
      dnComp: { compCode: '', compName: '', compName2: '' },
      huComp: { compCode: '', compName: '', compName2: '' }
    },
    productCondition: {
      isDc: false, isRebate: false, isComp: false, isInce: false, exVat: false
    },
    incomes: {
      free: null,
      discount: null,
      invoice: null,
      credit: null,
    },
    stepCondition: {
      cap: {
        isCap: false,
        capAmount: 0
      },
      stepType: 0,
      steps: [
        { min: 0, rate: 0 }
      ],
      step: { min: 0, rate: 0 }
    }
  })
  private readonly otherIncomeDual = inject(OiNotLightPairService)
  private readonly pairList = this.otherIncomeDual.pairList
  private readonly schema = computed(() => {
    const pair = this.pairList()
      .map(
        ({ displayName }) => displayName.toLocaleLowerCase().trim()
      )
    return createPairDcRebatePairSchema(pair);
  })

  createForm = form<TOtherIncomePairHead>(this.formData, this.schema())

  private get reqquest(): unknown {
    const {
      head: { displayName, period, event, dateRange: { startDate, endDate }, },
      comps: { dnComp, huComp },
      stepCondition: {
        step, steps, stepType, cap
      },
      productCondition: { isDc, isRebate, isComp, isInce, exVat },
      incomes: { invoice, credit, discount, free },
      products,
    } = this.formData()
    return {
      displayName, eventId: event?.id, period: period?.period, startDate, endDate,
      productList: products.map(p => p.goodCode),
      incomeIds: [invoice, credit, discount, free].flatMap(income => income ? [income.id] : []),
      dnCompCode: dnComp.compCode, huCompCode: huComp.compCode,
      isDc, isRebate, isComp, isInce, incVat: !exVat,
      capAmount: cap.isCap ? cap.capAmount : null,
      stepType,
      stepList: stepType === 1
        ? [{ ...step, max: null }]
        : steps.map((step, i, arr) => ({ ...step, max: arr[i + 1] ?? null }))
    }
  }

}

//   ```json
// {
//   "displayName": "คู่สัญญา Rebate 2024",

//   "eventId": 1,
//   "incomeIds": [1, 2],
//   "period": 12,
//   "startDate": "2024-01-01T00:00:00",
//   "endDate": "2024-12-31T23:59:59",
//   "productList": ["P0001", "P0002"],

//   "dnCompCode": "D001",
//   "huCompCode": "H001",

//   "isDc": false,
//   "isRebate": true,
//   "incVat": true,
//   "stepType": 3,
//   "capAmount": 500000.0,
//   "stepList": [
//     { "min": 0, "max": 100000, "rate": 2.0 },
//     { "min": 100000, "max": 500000, "rate": 3.0 },
//     { "min": 500000, "max": null, "rate": 3.5 }
//   ]
// }
// ```



