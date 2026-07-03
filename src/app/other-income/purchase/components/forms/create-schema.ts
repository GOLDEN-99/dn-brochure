import { apply, applyEach, applyWhen, disabled, max, min, minLength, readonly, required, schema, SchemaFn, validate } from "@angular/forms/signals"
import { TContractLabel, TDateRangeFormState, TIncomeLabel, TIncomeLabelType, TIncomeTypeEntry } from "../../../shared/types/other-income.type"
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

export const pairHeadSchema: (pairList: any[]) => SchemaFn<TContractHeadForm> = (pairList) => (schema) => {
    validate(schema.settlementPeriod, ({ value }) => value() === 0 ? { kind: 'invalid-period', message: 'กรุณาเลือก period เก็บเงิน' } : null)
    required(schema.settlementPeriod, { message: 'กรุณาเลือก period เก็บเงิน' })
    required(schema.contractLabel, { message: 'กรุณาเลือกประเภทกิจกรรม' })
    apply(schema.dateRange, dateRangeSchema)
}

export const contractHeadSchema = schema<TContractHeadForm>((schema) => {
    required(schema.settlementPeriod, { message: 'กรุณาเลือก period เก็บเงิน' })
    required(schema.contractLabel, { message: 'กรุณาเลือกประเภทกิจกรรม' })
    apply(schema.dateRange, dateRangeSchema)
});

export const compSchema: SchemaFn<TOtherIncomeComp> = (schema) => {
    required(schema.compCode, { message: 'กรุณาเลือกซัพ' })
}

export const capSchema: SchemaFn<TCapForm> = (schema) => {
    min(schema.capAmount, 0, { message: 'เพดานยอดซื้อต้องมากว่า 0' })
    required(schema.capAmount, { message: 'ต้องกำหนดเพดานยอดซื้อ' })
}

export const bracketStepSchema: SchemaFn<TBracketStepForm> = (schema) => {
    min(schema.min, 0, { message: 'ขั้นต่ำต้องไม่ติดลบ' })
    required(schema.rate, { message: 'กรุณาระบุเปอเซ็นในการคำนวน' })
    min(schema.rate, 0, { message: 'เปอเซ็นต้องมากกว่า 0' })
    max(schema.rate, 100, { message: 'เปอเซ็นต้องน้อยกว่า 100' })
}

export const calcSpecSchema: SchemaFn<TCalcSpecForm> = (schema) => {
    applyWhen(schema.cap, ({ value }) => !value().isCap, (_s) => { disabled(_s.capAmount) })
    required(schema.calcType)
}

export const pairCompSchema: SchemaFn<TPairComp> = (schema) => {
    apply(schema.dnComp, compSchema)
    readonly(schema.dnComp)
    apply(schema.huComp, compSchema)
    readonly(schema.huComp)
}

export const createPairedOrderContractSchema: (pairList: any[]) => SchemaFn<TCreatePairedOrderContractForm> = (pairList) => (schema) => {
    apply(schema.head, pairHeadSchema(pairList))
    minLength(schema.products, 1, { message: 'ต้องมีสินค้าอย่างน้อย 1 ชิ้น' })
    apply(schema.comps, pairCompSchema)
    apply(schema.calcSpec, calcSpecSchema)
    applyWhen(schema.calcSpec, ({ value }) => value().cap.isCap, (_s) => {
        required(_s.cap.capAmount)
        apply(_s.cap, capSchema)
    })
    applyWhen(schema.calcSpec, ({ value }) => {
        const { calcType } = value()
        return calcType === 'Flat'
    }, (_s) => {
        apply(_s.singleStep, bracketStepSchema)
    })
    applyWhen(schema.calcSpec, ({ value }) => {
        const { calcType } = value()
        return calcType === 'Step' || calcType === 'Cumulative'
    }, (_s) => {
        applyEach(_s.bracketSteps, bracketStepSchema)
        validate(_s.bracketSteps, ({ value }) => {
            const current = value()
            for (let i = 1; i < current.length; i++) {
                if (current[i].min <= current[i - 1].min) return { kind: 'invalid-min-step', message: 'ขั้นต่ำต้องมากกว่าขั้นก่อน' }
                if (current[i].rate <= current[i - 1].rate) return { kind: 'invalid-rate-step', message: 'เปอเช็นต์ต้องมากกว่าขั้นก่อน' }
            }
            return null
        })
    })
    applyWhen(schema.calcSpec,
        ({ value }) => value().calcType === null,
        (_s) => {
            disabled(_s.bracketSteps);
            disabled(_s.singleStep)
        }
    )
}

export const branchSpecSchema = schema<TBranchSpecForm>((schema) => {
    required(schema.maxIncome, { message: 'กรุณาระบุยอด' })
    min(schema.maxIncome, 0, { message: 'ยอดต้องมากกว่า 0 บาท' })
    required(schema.maxBranches, { message: 'กรุณาระบุจำนวนสาขา' })
    min(schema.maxBranches, 0, { message: 'จำนวนสาขาต้องมากกว่า 0 สาขา' })
})

export const companyProductSchema = schema<TOtherIncomeCompanyForm>((s) => {
    apply(s.comp, compSchema);
    minLength(s.products, 1, { message: 'ต้องมีสินค้าอย่างน้อย 1 ชิ้น' });
})

export const createOrderContractSchema = schema<TCreateOrderContractForm>((schema) => {
    apply(schema.head, contractHeadSchema)
    applyWhen(schema.comp, ({ value }) => value().compType === 'DN', (_s) => {
        apply(_s.dnComp, companyProductSchema);
    })
    applyWhen(schema.comp, ({ value }) => value().compType === 'HU', (_s) => {
        apply(_s.huComp, companyProductSchema);
    })
    apply(schema.calcSpec, calcSpecSchema)
    applyWhen(schema.calcSpec, ({ value }) => value().cap.isCap, (_s) => {
        required(_s.cap.capAmount)
        apply(_s.cap, capSchema)
    })
    applyWhen(schema.calcSpec, ({ value }) => {
        const { calcType } = value()
        return calcType === 'Flat'
    }, (_s) => {
        apply(_s.singleStep, bracketStepSchema)
    })
    applyWhen(schema.calcSpec, ({ value }) => {
        const { calcType } = value()
        return calcType === 'Step' || calcType === 'Cumulative'
    }, (_s) => {
        applyEach(_s.bracketSteps, bracketStepSchema)
        validate(_s.bracketSteps, ({ value }) => {
            const current = value()
            for (let i = 1; i < current.length; i++) {
                if (current[i].min <= current[i - 1].min) return { kind: 'invalid-min-step', message: 'ขั้นต่ำต้องมากกว่าขั้นก่อน' }
                if (current[i].rate <= current[i - 1].rate) return { kind: 'invalid-rate-step', message: 'เปอเช็นต์ต้องมากกว่าขั้นก่อน' }
            }
            return null
        })
    })
    applyWhen(schema.calcSpec,
        ({ value }) => value().calcType === null,
        (_s) => {
            disabled(_s.bracketSteps);
            disabled(_s.singleStep)
        }
    )
})


export const createPromoContractSchema = schema<TCreatePromoContractForm>((schema) => {
    apply(schema.head, contractHeadSchema);
    applyWhen(schema.comp, ({ value }) => value().compType === 'DN', (_s) => {
        apply(_s.dnComp, compSchema)
    });
    applyWhen(schema.comp, ({ value }) => value().compType === 'HU', (_s) => {
        apply(_s.huComp, compSchema)
    });
})

export const createBranchContractSchema = schema<TCreateBranchContractForm>((schema) => {
    apply(schema.head, contractHeadSchema)
    applyWhen(schema.comp, ({ value }) => value().compType === 'DN', (_s) => {
        apply(_s.dnComp, compSchema)
    });
    applyWhen(schema.comp, ({ value }) => value().compType === 'HU', (_s) => {
        apply(_s.huComp, compSchema)
    });
    apply(schema.branchSpec, branchSpecSchema)
})

// ---------- Form types ----------

export type TContractHeadForm = {
    settlementPeriod: number | null
    contractLabel: TContractLabel | null
    dateRange: TDateRangeFormState
    bill: TIncomeLabel | null
    freeItem: TIncomeLabel | null
    invoice: TIncomeLabel | null
    creditNote: TIncomeLabel | null
}

export type TOtherIncomeComp = {
    compCode: string
    compName: string
    compName2: string
}

export type TOtherIncomeCompanyForm = {
    comp: TOtherIncomeComp
    products: Array<TOtherIncomeProductItemState>
}

export type TOtherIncomeCompanyProduct = {
    compType: CompType;
    dnComp: TOtherIncomeCompanyForm;
    huComp: TOtherIncomeCompanyForm
}


export type TOtherIncomeCompany = {
    compType: CompType;
    dnComp: TOtherIncomeComp
    huComp: TOtherIncomeComp
}


export type TCalcSpecForm = {
    cap: TCapForm
    calcType: 'Flat' | 'Step' | 'Cumulative' | null
    bracketSteps: Array<TBracketStepForm>
    singleStep: TBracketStepForm
}

export type TBracketStepForm = {
    min: number
    rate: number
}

export type TExcludeFlagsForm = {
    excludeDc: boolean
    excludeRebate: boolean
    excludeComp: boolean
    excludeInce: boolean
    excludeVat: boolean
}

export type TCapForm = {
    isCap: boolean
    capAmount: number
}

export type TOtherIncomeProductItemState = {
    goodCode: string
    goodName: string
    barCode: string
}

export type TBranchSpecForm = {
    maxBranches: number
    maxIncome: number
}

export type TPairComp = {
    dnComp: TOtherIncomeComp & { compType: 'DN' };
    huComp: TOtherIncomeComp & { compType: 'HU' };
}

export type TCreatePairedOrderContractForm = {
    head: TContractHeadForm
    comps: TPairComp
    products: Array<TOtherIncomeProductItemState>
    excludeFlags: TExcludeFlagsForm
    calcSpec: TCalcSpecForm
}

export type TCreateOrderContractForm = {
    head: TContractHeadForm
    comp: TOtherIncomeCompanyProduct
    excludeFlags: TExcludeFlagsForm
    calcSpec: TCalcSpecForm
}

export type TCreatePromoContractForm = {
    head: TContractHeadForm
    comp: TOtherIncomeCompany
}

export type TCreateBranchContractForm = {
    head: TContractHeadForm
    comp: TOtherIncomeCompany
    branchSpec: TBranchSpecForm
}

// ---------- Form mappers ----------

import type {
    TCreateOrderContractReq,
    TCreatePairedOrderContractReq,
    TUpdateOrderContractSpecReq,
    TCreateBranchContractReq,
    TCreatePromoContractReq,
    TContractStep,
} from '../../../shared/types/other-income.type'
import { CompType } from "../../../shared/libs/other-income-schema"

function resolveIncomeTypes(h: TContractHeadForm): TIncomeTypeEntry[] {
    const entries: Array<[TIncomeLabelType, TIncomeLabel | null]> = [
        ['Bill', h.bill],
        ['FreeItem', h.freeItem],
        ['Invoice', h.invoice],
        ['CreditNote', h.creditNote],
    ]
    return entries
        .filter(([, label]) => label !== null)
        .map(([incomeType, label]) => ({ incomeType, incomeLabelId: label!.id }))
}

function calcSpecToSteps(spec: TCalcSpecForm): TContractStep[] {
    if (spec.calcType === 'Flat') {
        return [{ min: spec.singleStep.min, max: null, rate: spec.singleStep.rate }]
    }
    return spec.bracketSteps.map((s, i, arr) => ({
        min: s.min,
        max: arr[i + 1]?.min ?? null,
        rate: s.rate,
    }))
}

export function mapOrderContractFormToCreateReq(state: TCreateOrderContractForm): TCreateOrderContractReq {
    const { compType, dnComp, huComp } = state.comp
    const selectCompProduct = compType === 'DN' ? dnComp : huComp
    const { comp: { compCode }, products } = selectCompProduct
    const { excludeFlags: f, calcSpec: c, head: h } = state
    return {
        compCode, compType,
        contractLabelId: h.contractLabel!.id,
        settlementPeriod: h.settlementPeriod!,
        startDate: formatDate(h.dateRange.startDate),
        endDate: formatDate(h.dateRange.endDate),
        supplierPairId: null,
        spec: {
            calcType: c.calcType!,
            capAmount: c.cap.isCap ? c.cap.capAmount : null,
            excludeVat: f.excludeVat,
            excludeDc: f.excludeDc,
            excludeRebate: f.excludeRebate,
            excludeInce: f.excludeInce,
            excludeComp: f.excludeComp,
        },
        steps: calcSpecToSteps(c),
        productGoodCodes: products.map(p => p.goodCode),
        incomeTypes: resolveIncomeTypes(h),
    }
}

export function mapOrderContractFormToSpecReq(state: TCreateOrderContractForm): TUpdateOrderContractSpecReq {
    const { excludeFlags: f, calcSpec: c } = state
    return {
        calcType: c.calcType!,
        capAmount: c.cap.isCap ? c.cap.capAmount : null,
        excludeVat: f.excludeVat,
        excludeDc: f.excludeDc,
        excludeRebate: f.excludeRebate,
        excludeInce: f.excludeInce,
        excludeComp: f.excludeComp,
        steps: calcSpecToSteps(c),
    }
}

export function mapPairedOrderContractFormToCreateReq(state: TCreatePairedOrderContractForm): TCreatePairedOrderContractReq {
    const { excludeFlags: f, calcSpec: c, head: h, products } = state
    return {
        supplierPairId: 0, // caller must supply supplierPairId before submitting
        contractLabelId: h.contractLabel!.id,
        settlementPeriod: h.settlementPeriod!,
        startDate: formatDate(h.dateRange.startDate),
        endDate: formatDate(h.dateRange.endDate),
        spec: {
            calcType: c.calcType!,
            capAmount: c.cap.isCap ? c.cap.capAmount : null,
            excludeVat: f.excludeVat,
            excludeDc: f.excludeDc,
            excludeRebate: f.excludeRebate,
            excludeInce: f.excludeInce,
            excludeComp: f.excludeComp,
        },
        steps: calcSpecToSteps(c),
        productGoodCodes: products.map(p => p.goodCode),
        incomeTypes: resolveIncomeTypes(h),
    }
}

export function mapBranchContractFormToCreateReq(state: TCreateBranchContractForm): TCreateBranchContractReq {
    const { compType, dnComp, huComp } = state.comp
    const { compCode } = compType === 'DN' ? dnComp : huComp
    const { head: h, branchSpec: b } = state
    return {
        compCode, compType,
        contractLabelId: h.contractLabel!.id,
        settlementPeriod: h.settlementPeriod!,
        startDate: formatDate(h.dateRange.startDate),
        endDate: formatDate(h.dateRange.endDate),
        maxBranches: b.maxBranches,
        ratePerBranch: Math.round((b.maxIncome / b.maxBranches) * 100) / 100,
        incomeTypes: resolveIncomeTypes(h),
    }
}

export function mapPromoContractFormToCreateReq(state: TCreatePromoContractForm): TCreatePromoContractReq {
    const { compType, dnComp, huComp } = state.comp
    const { compCode } = compType === 'DN' ? dnComp : huComp
    const { head: h } = state
    return {
        compCode, compType,
        contractLabelId: h.contractLabel!.id,
        settlementPeriod: h.settlementPeriod!,
        startDate: formatDate(h.dateRange.startDate),
        endDate: formatDate(h.dateRange.endDate),
        incomeTypes: resolveIncomeTypes(h),
    }
}

function formatDate({ year, month, day }: import('@ng-bootstrap/ng-bootstrap').NgbDateStruct): string {
    const mm = String(month).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${year}-${mm}-${dd}`
}
