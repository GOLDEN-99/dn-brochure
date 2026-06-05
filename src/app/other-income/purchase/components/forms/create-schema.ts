import { apply, applyEach, applyWhen, disabled, max, min, minLength, readonly, required, schema, SchemaFn, validate } from "@angular/forms/signals"
import { TDateRangeFormState, TOtherIncomeEvent, TOtherIncomeIncome } from "../../../shared/types/other-income.type"
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap"

const hashDateStruct = ({ year, month, day }: NgbDateStruct) => year * 10000 + month * 100 + day


export const dateRangeSchema: SchemaFn<TDateRangeFormState> = (schema) => {
    validate(schema, ({ value }) => {
        const { startDate, endDate } = value()
        return hashDateStruct(endDate) > hashDateStruct(startDate) ? null : { kind: 'invalid-date-range', message: 'วันที่จบต้องมากกว่าวันที่เริ่ม' }
    })
    required(schema.startDate)
    required(schema.endDate)
}
export const headPairSchema: (pairList: any[]) => SchemaFn<TOtherIncomeHeadFormState> = (pairList) => (schema) => {
    required(schema.displayName, { message: 'กรุณาใส่ชื่อหัวร่วม' })
    validate(schema.displayName, ({ value }) => {
        const current = value().toLocaleLowerCase().trim()
        return pairList.includes(current) ? { kind: 'duplicate-pair-name', message: 'ชื่อหัวร่วมซ้ำ' } : null
    })
    validate(schema.period, ({ value }) => value()?.period === 0 ? { kind: 'invalid-period', message: 'กรุณาเลือก period เก็บเงิน' } : null)
    required(schema.period, { message: 'กรุณาเลือก period เก็บเงิน' })
    required(schema.event, { message: 'กรุณาเลือกประเภทกิจกรรม' })
    apply(schema.dateRange, dateRangeSchema)
}

export const metadataHeadSchema = schema<TOtherIncomeHeadFormState>((schema) => {
    required(schema.displayName, { message: 'กรุณาใส่ชื่อหัวร่วม' })
    required(schema.period, { message: 'กรุณาเลือก period เก็บเงิน' })
    required(schema.event, { message: 'กรุณาเลือกประเภทกิจกรรม' })
    apply(schema.dateRange, dateRangeSchema)
});

export const compSchema: SchemaFn<TOtherIncomeComp> = (schema) => {
    required(schema.compCode, { message: 'กรุณาเลือกซัพ' })
}

export const stepCapSchema: SchemaFn<TOtherIncomeCapFormState> = (schema) => {
    min(schema.capAmount, 0, { message: 'เพดานยอดซื้อต้องมากว่า 0' })
    required(schema.capAmount, { message: 'ต้องกำหนดเพดานยอดซื้อ' })
}
export const stepItemSchema: SchemaFn<TOtherIncomeStepItemFormState> = (schema) => {
    min(schema.min, 0, { message: 'ขั้นต่ำต้องไม่ติดลบ' })
    required(schema.rate, { message: 'กรุณาระบุเปอเซ็นในการคำนวน' })
    min(schema.rate, 0, { message: 'เปอเซ็นต้องมากกว่า 0' })
    max(schema.rate, 100, { message: 'เปอเซ็นต้องน้อยกว่า 100' })
}

export const stepConditionSchema: SchemaFn<TOtherIncomeStepFormState> = (schema) => {
    applyWhen(schema.cap, ({ value }) => !value().isCap, (_s) => { disabled(_s.capAmount) })
    required(schema.stepType)

}

export const pairCompSchema: SchemaFn<TOtherIncomeCompFormState> = (schema) => {
    apply(schema.dnComp, compSchema)
    readonly(schema.dnComp)
    apply(schema.huComp, compSchema)
    readonly(schema.huComp)
}

export const singleCompSchema: SchemaFn<TOtherIncomeCompWithType> = schema => {
    applyWhen(schema.dnComp, ({ valueOf }) => valueOf(schema.dn), compSchema)
    applyWhen(schema.huComp, ({ valueOf }) => valueOf(schema.hu), compSchema)
    validate(schema, ({ value }) => {
        const { dn, hu } = value()
        if (dn === hu) return { kind: 'invalid comp selection', message: 'ประเภทบริษัทไม่ถูกต้อง' }
        return null
    })
}

export const createPairDcRebatePairSchema: (pairList: any[]) => SchemaFn<TOtherIncomePairHead> = (pairList) => (schema) => {

    apply(schema.head, headPairSchema(pairList))
    minLength(schema.products, 1, { message: 'ต้องมีสินค้าอย่างน้อย 1 ชิ้น' })
    apply(schema.comps, pairCompSchema)
    apply(schema.stepCondition, stepConditionSchema)
    applyWhen(schema.stepCondition, ({ value }) => value().cap.isCap, (_s) => {
        required(_s.cap.capAmount)
        apply(_s.cap, stepCapSchema)
    })
    //validate step if step type = 1
    applyWhen(schema.stepCondition, ({ value }) => {
        const { stepType } = value()
        return stepType === 1
    }, (_s) => {
        apply(_s.step, stepItemSchema)
    })
    // validate steps if step type in 2,3
    applyWhen(schema.stepCondition, ({ value }) => {
        const { stepType } = value()
        return stepType === 2 || stepType === 3
    }, (_s) => {
        applyEach(_s.steps, stepItemSchema)
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

}

export const branchContractDetailSchema = schema<TBranchContractDetail>((schema) => {
    required(schema.maxAmount, { message: 'กรุณาระบุยอด' })
    min(schema.maxAmount, 0, { message: 'ยอดต้องมากกว่า 0 บาท' })
    required(schema.maxBranch, { message: 'กรุณาระบุจำนวนสาขา' })
    min(schema.maxBranch, 0, { message: 'จำนวนสาขาต้องมากกว่า 0 สาขา' })
})

export const createDcRebateSchema = schema<TOtherIncomeDcRebate>((schema) => {
    apply(schema.head, metadataHeadSchema)
    minLength(schema.products, 1, { message: 'ต้องมีสินค้าอย่างน้อย 1 ชิ้น' })
    apply(schema.comp, singleCompSchema)
    apply(schema.stepCondition, stepConditionSchema)
    applyWhen(schema.stepCondition, ({ value }) => value().cap.isCap, (_s) => {
        required(_s.cap.capAmount)
        apply(_s.cap, stepCapSchema)
    })
    //validate step if step type = 1
    applyWhen(schema.stepCondition, ({ value }) => {
        const { stepType } = value()
        return stepType === 1
    }, (_s) => {
        apply(_s.step, stepItemSchema)
    })
    // validate steps if step type in 2,3
    applyWhen(schema.stepCondition, ({ value }) => {
        const { stepType } = value()
        return stepType === 2 || stepType === 3
    }, (_s) => {
        applyEach(_s.steps, stepItemSchema)
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
})

export const createPromotionSchema = schema<TOtherIncomePromotion>((schema) => {
    apply(schema.head, metadataHeadSchema)
    apply(schema.comp, singleCompSchema)
})

export const createBranchContractSchema = schema<TOtherIncomeBranch>((schema) => {
    apply(schema.head, metadataHeadSchema)
    apply(schema.comp, singleCompSchema)
    apply(schema.branchSpec, branchContractDetailSchema)
})

export type TOtherIncomePeriod = { period: number, periodName: string }

export type TOtherIncomeHeadFormState = {
    displayName: string
    period: TOtherIncomePeriod | null
    event: TOtherIncomeEvent | null
    dateRange: TDateRangeFormState
}


export type TOtherIncomeComp = {
    compCode: string
    compName: string
    compName2: string
}

export type TOtherIncomeCompWithType = {
    dn: boolean
    dnComp: TOtherIncomeComp
    hu: boolean
    huComp: TOtherIncomeComp
}

export type TOtherIncomeCompFormState = {
    dnComp: TOtherIncomeComp
    huComp: TOtherIncomeComp
}

export type TOtherIncomeStepFormState = {
    cap: TOtherIncomeCapFormState
    stepType: number
    steps: Array<TOtherIncomeStepItemFormState>
    step: TOtherIncomeStepItemFormState
}

export type TOtherIncomeStepItemFormState = {
    min: number
    rate: number
}

export type TOtherIncomeProductConditionFormState = {
    isDc: boolean
    isRebate: boolean
    isComp: boolean
    isInce: boolean
    exVat: boolean // ! vincVat
}

export type TOtherIncomeIncomeFormState = {
    free: TOtherIncomeIncome | null
    discount: TOtherIncomeIncome | null
    invoice: TOtherIncomeIncome | null
    credit: TOtherIncomeIncome | null
}

export type TOtherIncomeCapFormState = {
    isCap: boolean
    capAmount: number
}

export type TOtherIncomeProductItemState = {
    goodCode: string
    goodName: string
    barCode: string
}

export type TBranchContractDetail = {
    maxBranch: number
    maxAmount: number
}

export type TOtherIncomePairHead = {
    head: TOtherIncomeHeadFormState
    comps: TOtherIncomeCompFormState
    products: Array<TOtherIncomeProductItemState>
    productCondition: TOtherIncomeProductConditionFormState
    stepCondition: TOtherIncomeStepFormState
    incomes: TOtherIncomeIncomeFormState
}

export type TOtherIncomeDcRebate = {
    head: TOtherIncomeHeadFormState
    comp: TOtherIncomeCompWithType
    products: Array<TOtherIncomeProductItemState>
    productCondition: TOtherIncomeProductConditionFormState
    stepCondition: TOtherIncomeStepFormState
    incomes: TOtherIncomeIncomeFormState
}

export type TOtherIncomePromotion = {
    head: TOtherIncomeHeadFormState
    comp: TOtherIncomeCompWithType
}

export type TOtherIncomeBranch = {
    head: TOtherIncomeHeadFormState
    comp: TOtherIncomeCompWithType
    branchSpec: TBranchContractDetail
}