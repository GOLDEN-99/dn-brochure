import { Component, computed, inject, signal } from '@angular/core';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OiNotLightPairService } from '../../../../../service/other-income/oi-not-light-pair.service';
import { apply, applyEach, applyWhen, disabled, form, FormField, max, min, minLength, readonly, required, SchemaFn, validate } from '@angular/forms/signals';
import { TOtherIncomeEvent, TOtherIncomeIncome } from '../../../../shared/types/other-income.type';
import { StepFormComponent } from "../../forms/step-form/step-form.component";
import { OtherIncomeIncomeSelectComponent } from "../../../../shared/components/other-income-income-select/other-income-income-select.component";
import { JsonPipe } from '@angular/common';
import { CreatePairCompanyPickerComponent } from "../../forms/create-pair-company-picker/create-pair-company-picker.component";
import { CreatePairHeadComponent } from "../../forms/create-pair-head/create-pair-head.component";
import { CreatePairProductPickerComponent } from "../../forms/create-pair-product-picker/create-pair-product-picker.component";
import { ProductConditionFormComponent } from "../../forms/product-condition-form/product-condition-form.component";

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
  private readonly normalizePair = computed(() =>
    this.pairList()
      .map(
        ({ displayName }) => displayName.toLocaleLowerCase().trim()
      )
  )
  private readonly hashDateStruct = ({ year, month, day }: NgbDateStruct) => year * 10000 + month * 100 + day
  private readonly dateRangeSchema: SchemaFn<TDateRangeFormState> = (schema) => {
    validate(schema, ({ value }) => {
      const { startDate, endDate } = value()
      return this.hashDateStruct(endDate) > this.hashDateStruct(startDate) ? null : { kind: 'invalid-date-range', message: 'วันที่จบต้องมากกว่าวันที่เริ่ม' }
    })
    required(schema.startDate)
    required(schema.endDate)
  }
  private readonly headSchema: SchemaFn<TOtherIncomeHeadFormState> = (schema) => {
    required(schema.displayName, { message: 'กรุณาใส่ชื่อหัวร่วม' })
    validate(schema.displayName, ({ value }) => {
      const current = value().toLocaleLowerCase().trim()
      return this.normalizePair().includes(current) ? { kind: 'duplicate-pair-name', message: 'ชื่อหัวร่วมซ้ำ' } : null
    })
    //validate(schema.period, ({ value }) => value()?.period === 0 ? { kind: 'invalid-period', message: 'กรุณาเลือก period เก็บเงิน' } : null)
    required(schema.period, { message: 'กรุณาเลือก period เก็บเงิน' })
    required(schema.event, { message: 'กรุณาเลือกประเภทกิจกรรม' })
    apply(schema.dateRange, this.dateRangeSchema)
  }
  private readonly compSchema: SchemaFn<TOtherIncomeComp> = (schema) => {
    required(schema.compCode, { message: 'กรุณาเลือกซัพ' })
  }
  private readonly stepCapSchema: SchemaFn<TOtherIncomeCapFormState> = (schema) => {
    min(schema.capAmount, 0, { message: 'เพดานยอดซื้อต้องมากว่า 0' })
    required(schema.capAmount, { message: 'ต้องกำหนดเพดานยอดซื้อ' })
  }
  private readonly stepItemSchema: SchemaFn<TOtherIncomeStepItemFormState> = (schema) => {
    min(schema.min, 0, { message: 'ขั้นต่ำต้องไม่ติดลบ' })
    required(schema.rate, { message: 'กรุณาระบุเปอเซ็นในการคำนวน' })
    min(schema.rate, 0, { message: 'เปอเซ็นต้องมากกว่า 0' })
    max(schema.rate, 100, { message: 'เปอเซ็นต้องน้อยกว่า 100' })
  }
  private readonly stepConditionSchema: SchemaFn<TOtherIncomeStepFormState> = (schema) => {
    applyWhen(schema.cap, ({ value }) => !value().isCap, (_s) => { disabled(_s.capAmount) })
    required(schema.stepType)

  }
  private readonly pairCompSchema: SchemaFn<TOtherIncomeCompFormState> = (schema) => {
    apply(schema.dnComp, this.compSchema)
    readonly(schema.dnComp)
    apply(schema.huComp, this.compSchema)
    readonly(schema.huComp)
  }
  createForm = form<TOtherIncomePairHead>(this.formData, (schema) => {

    apply(schema.head, this.headSchema)
    minLength(schema.products, 1, { message: 'ต้องมีสินค้าอย่างน้อย 1 ชิ้น' })
    apply(schema.comps, this.pairCompSchema)
    apply(schema.stepCondition, this.stepConditionSchema)
    applyWhen(schema.stepCondition, ({ value }) => value().cap.isCap, (_s) => {
      required(_s.cap.capAmount)
      apply(_s.cap, this.stepCapSchema)
    })
    //validate step if step type = 1
    applyWhen(schema.stepCondition, ({ value }) => {
      const { stepType } = value()
      return stepType === 1
    }, (_s) => {
      apply(_s.step, this.stepItemSchema)
    })
    // validate steps if step type in 2,3
    applyWhen(schema.stepCondition, ({ value }) => {
      const { stepType } = value()
      return stepType === 2 || stepType === 3
    }, (_s) => {
      applyEach(_s.steps, this.stepItemSchema)
      validate(_s.steps, ({ value }) => {
        const current = value()
        for (let i = 1; i < current.length; i++) {
          if (current[i].min <= current[i - 1].min) return { kind: 'invalid-min-step', message: 'ขั้นต่ำต้องมากกว่าขั้นก่อน' }
          if (current[i].rate <= current[i - 1].rate) return { kind: 'invalid-rate-step', message: 'เปอเช็นต์ต้องมากกว่าขั้นก่อน' }
        }
        return null
      })
    })
    // disable if not select radio
    applyWhen(schema.stepCondition,
      ({ value }) => value().stepType === 0,
      (_s) => {
        disabled(_s.steps);
        disabled(_s.step)
      }
    )
    // allow any incomes state

  })

  private get value(): unknown {
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

