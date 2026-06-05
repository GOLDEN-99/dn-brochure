import { Component, inject, signal } from '@angular/core';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TDateRangeFormState, TOtherIncomeEvent, TOtherIncomeIncome } from '../../../../shared/types/other-income.type';
import { createDcRebateSchema, TOtherIncomeCompWithType, TOtherIncomeDcRebate } from '../../forms/create-schema';
import { OtherIncomeIncomeSelectComponent } from "../../../../shared/components/other-income-income-select/other-income-income-select.component";
import { form } from '@angular/forms/signals';
import { ProductConditionFormComponent } from "../../forms/product-condition-form/product-condition-form.component";
import { StepFormComponent } from "../../forms/step-form/step-form.component";
import { COMP_TYPE } from '../../../../shared/libs/other-income-schema';

@Component({
  selector: 'app-other-income-create-dc',
  imports: [OtherIncomeIncomeSelectComponent, ProductConditionFormComponent, StepFormComponent],
  templateUrl: './other-income-create-dc.component.html',
  styles: '',
})
export class OtherIncomeCreateDcComponent {
  private readonly calendarService = inject(NgbCalendar)
  startOfYear: NgbDateStruct = {
    ...this.calendarService.getToday(), day: 1, month: 1
  }
  endOfYear: NgbDateStruct = {
    ...this.calendarService.getToday(), day: 31, month: 12
  }
  formData = signal<TOtherIncomeDcRebate>({
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
    comp: {
      dn: true, dnComp: { compCode: '', compName: '', compName2: '' },
      hu: false, huComp: { compCode: '', compName: '', compName2: '' }
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

  createForm = form(this.formData, createDcRebateSchema)

  private get request(): unknown {
    const {
      head: { displayName, period, event, dateRange: { startDate, endDate }, },
      comp,
      stepCondition: {
        step, steps, stepType, cap
      },
      productCondition: { isDc, isRebate, isComp, isInce, exVat },
      incomes: { invoice, credit, discount, free },
      products,
    } = this.formData()
    const parseComp = handleComp(comp)
    if (parseComp === null) throw new Error('invalid comp')
    return {
      displayName, eventId: event?.id, period: period?.period, startDate, endDate,
      productList: products.map(p => p.goodCode),
      incomeIds: [invoice, credit, discount, free].flatMap(income => income ? [income.id] : []),
      ...parseComp,
      isDc, isRebate, isComp, isInce, incVat: !exVat,
      capAmount: cap.isCap ? cap.capAmount : null,
      stepType,
      stepList: stepType === 1
        ? [{ ...step, max: null }]
        : steps.map((step, i, arr) => ({ ...step, max: arr[i + 1] ?? null }))
    }
  }
}

const handleComp = ({ dn, dnComp, hu, huComp }: TOtherIncomeCompWithType) => {
  if (dn === hu) {
    return null
  }
  if (dn) {
    return { compCode: dnComp.compCode, compType: COMP_TYPE['dn'] }
  }
  if (hu) {
    return { compCode: huComp.compCode, compType: COMP_TYPE['hu'] }
  }
  return null
}

type TOtherIncomePeriod = { period: number, periodName: string }

type TOtherIncomeHeadFormState = {
  displayName: string
  period: TOtherIncomePeriod | null
  event: TOtherIncomeEvent | null
  dateRange: TDateRangeFormState
}


type TOtherIncomeComp = {
  compCode: string
  compName: string
  compName2: string
}

type TOtherIncomeCompFormState = {
  dnComp: TOtherIncomeComp
  huComp: TOtherIncomeComp
}

type TOtherIncomeStepFormState = {
  cap: TOtherIncomeCapFormState
  stepType: number
  steps: Array<TOtherIncomeStepItemFormState>
  step: TOtherIncomeStepItemFormState
}

type TOtherIncomeStepItemFormState = {
  min: number
  rate: number
}

type TOtherIncomeProductConditionFormState = {
  isDc: boolean
  isRebate: boolean
  isComp: boolean
  isInce: boolean
  exVat: boolean // ! vincVat
}

type TOtherIncomeIncomeFormState = {
  free: TOtherIncomeIncome | null
  discount: TOtherIncomeIncome | null
  invoice: TOtherIncomeIncome | null
  credit: TOtherIncomeIncome | null
}

type TOtherIncomeCapFormState = {
  isCap: boolean
  capAmount: number
}

type TOtherIncomeProductItemState = {
  goodCode: string
  goodName: string
  barCode: string
}

type TOtherIncomePairHead = {
  head: TOtherIncomeHeadFormState
  comps: TOtherIncomeCompFormState
  products: Array<TOtherIncomeProductItemState>
  productCondition: TOtherIncomeProductConditionFormState
  stepCondition: TOtherIncomeStepFormState
  incomes: TOtherIncomeIncomeFormState
}
