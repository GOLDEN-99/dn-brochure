import { Component, computed, inject, signal } from '@angular/core';
import { apply, applyEach, applyWhen, applyWhenValue, form, max, min, minLength, required, Schema, SchemaFn, validate, FormField, disabled } from '@angular/forms/signals';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OiNotLightPairService } from '../../../service/other-income/oi-not-light-pair.service';
import { OtherIncomeEventSelectComponent } from '../../../other-income/components/features/other-income-event-select/other-income-event-select.component';
import { TOtherIncomeEvent, TOtherIncomeIncome } from '../../../other-income/types/other-income.type';
import { OtherIncomeIncomeSelectComponent } from "../../../other-income/components/features/other-income-income-select/other-income-income-select.component";
import { JsonPipe } from '@angular/common';
import { SelectComponent } from "../../../shared/components/select/select.component";
import { SignalDatepickerComponent } from "../../../components/crm-promotion/signal-datepicker.component";
import { OptionComponent } from "../../../shared/components/select/option.component";
import { FormAlertTextComponent } from "../../../components/crm-promotion/form-alert-text.component";

@Component({
  selector: 'app-create-pair-forms',
  imports: [FormField, OtherIncomeEventSelectComponent, OtherIncomeIncomeSelectComponent, JsonPipe, SelectComponent, SignalDatepickerComponent, OptionComponent, FormAlertTextComponent],
  templateUrl: './create-pair-forms.component.html',
  styleUrl: './create-pair-forms.component.scss',
})
export class CreatePairFormsComponent {
  periodList = [1,2,3,6,12].map(period => ({period, periodName: `${period} เดือน`}))
  private readonly calendarService = inject(NgbCalendar)
  startOfYear: NgbDateStruct = {
    ...this.calendarService.getToday(), day: 1, month: 1
  }
  endOfYear: NgbDateStruct = {
    ...this.calendarService.getToday(), day: 31, month: 12
  }
  formData = signal<TOtherIncomePairHead>({
    displayName: "",
    head: {
      period: null,
      event: null,
      dateRange: {
        startDate: this.startOfYear,
        endDate: this.endOfYear
      }
    },
    products: [],
    comps: {
      dnCompCode: { compCode: '', compName: '', compName2: '' },
      huCompCode: { compCode: '', compName: '', compName2: '' }
    },
    notLight: {
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
      ]
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
  }
  private readonly headSchema: SchemaFn<TOtherIncomeHeadFormState> = (schema) => {
    validate(schema.period, ({ value }) => value()?.period === 0 ? { kind: 'invalid-period', message: 'กรุณาเลือก period เก็บเงิน' } : null)
    validate(schema.event, ({ value }) => value() === null ? { kind: 'invalid-event', message: 'กรุณาเลือกประเภทกิจกรรม' } : null)
    apply(schema.dateRange, this.dateRangeSchema)
  }
  private readonly compSchema: SchemaFn<TOtherIncomeComp> = (schema) => {
    required(schema.compCode, { message: 'กรุณาเลือกซัพ' })
  }
  private readonly notLightSchema: SchemaFn<TOtherIncomeNotLightFormState> = (schema) => {
    // no validatiobn needed
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
    applyWhen(schema.cap, ({ value }) => value().isCap, this.stepCapSchema)
    applyWhen(schema.cap, ({value}) => !value().isCap, (_s) => {disabled(_s.capAmount)})
    validate(schema.stepType, ({ value }) => value() === 0 ? { kind: 'invalid-step-type', message: 'กรุณาเลือกประเภทขั้นการคำนวน' } : null)
    applyEach(schema.steps, this.stepItemSchema)
    validate(schema.steps, ({ value }) => {
      const current = value()
      for (let i = 1; i < current.length; i++) {
        if (current[i].min <= current[i - 1].min) return { kind: 'invalid-min-step', message: 'ขั้นต่ำต้องมากกว่าขั้นก่อน' }
        if (current[i].rate <= current[i - 1].rate) return { kind: 'invalid-rate-step', message: 'เปอเช็นต์ต้องมากกว่าขั้นก่อน' }
      }
      return null
    })
  }
  private readonly pairCompSchema: SchemaFn<TOtherIncomeCompFormState> = (schema) => {
    apply(schema.dnCompCode, this.compSchema)
    apply(schema.huCompCode, this.compSchema)
  }
  createForm = form<TOtherIncomePairHead>(this.formData, (schema) => {
    required(schema.displayName, { message: 'กรุณาใส่ชื่อหัวร่วม' })
    validate(schema.displayName, ({ value }) => {
      const current = value().toLocaleLowerCase().trim()
      return this.normalizePair().includes(current) ? { kind: 'duplicate-pair-name', message: 'ชื่อหัวร่วมซ้ำ' } : null
    })
    apply(schema.head, this.headSchema)
    minLength(schema.products, 1, { message: 'ต้องมีสินค้าอย่างน้อย 1 ชิ้น' })
    apply(schema.comps, this.pairCompSchema)
    apply(schema.stepCondition, this.stepConditionSchema)
    // allow any incomes state

  })


  onAddStep(){
    this.formData.update(({stepCondition: {steps, ...cond}, ...res}) => ({...res, stepCondition: {...cond, steps: [...steps, {min: 0, rate: 0}]}}))
  }
}

type TOtherIncomePeriod = {period: number, periodName: string}

type TOtherIncomeHeadFormState = {
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
  dnCompCode: TOtherIncomeComp
  huCompCode: TOtherIncomeComp
}

type TOtherIncomeStepFormState = {
  cap: TOtherIncomeCapFormState
  stepType: number
  steps: Array<TOtherIncomeStepItemFormState>
}

type TOtherIncomeStepItemFormState = {
  min: number
  rate: number
}

type TOtherIncomeNotLightFormState = {
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
  barcode: string
}

type TOtherIncomePairHead = {
  displayName: string
  head: TOtherIncomeHeadFormState
  comps: TOtherIncomeCompFormState
  products: Array<TOtherIncomeProductItemState>
  notLight: TOtherIncomeNotLightFormState
  stepCondition: TOtherIncomeStepFormState
  incomes: TOtherIncomeIncomeFormState
}

type TOIEvent = {
  eventId: number
  eventName: string
  eventType: number
}

// ### Create Pair with Not - Light in One Step

//   ** Endpoint **: `POST /other-income/pair/full`

// Creates the pair record, DN head + not - light + steps, and HU head + not - light + steps inside a single transaction.
// `isInce` and `isComp` are always `false` for pair contracts — only `isDc` and `isRebate` apply.

// ** Request **: `CreatePairNotLightRequest`

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