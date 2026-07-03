import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap"
import { TMaybe } from "../../../shared/types/index.type"

export type TDateRangeFormState = {
  startDate: NgbDateStruct
  endDate: NgbDateStruct
}

// ---------- Master data ----------

export type TOtherIncomeCompanyRes = {
  compCode: string
  compName: string
  compName2: string
  compGroupCode: string
  compType: 'DN' | 'HU'
}

// ---------- Lookup labels ----------

export type TContractLabelType = 'ORDER' | 'BRANCH' | 'PROMO'

export type TContractLabel = {
  id: number
  eventName: string
  eventType: TContractLabelType
}

export type TIncomeLabelType = 'Bill' | 'FreeItem' | 'Invoice' | 'CreditNote'

export type TIncomeLabel = {
  id: number
  incomeName: string
  incomeType: TIncomeLabelType
}

// ---------- Calc type ----------

export const CALC_TYPE = {
  flat: 'Flat',
  step: 'Step',
  cumulative: 'Cumulative',
} as const

export type TCalcType = (typeof CALC_TYPE)[keyof typeof CALC_TYPE]

// ---------- Shared contract base ----------

export type TContractBase = {
  id: number
  compCode: string
  compName: TMaybe<string>
  compType: 'DN' | 'HU'
  contractLabelId: number
  contractLabelName: string
  settlementPeriod: number
  startDate: string
  endDate: string
  createdAt: string
}

// ---------- Track A — Order contracts ----------

export type TOrderContractListItem = TContractBase & { supplierPairId: TMaybe<number> }

export type TOrderContractSpec = {
  id: number
  calcType: TCalcType
  capAmount: TMaybe<number>
  excludeVat: boolean
  excludeDc: boolean
  excludeRebate: boolean
  excludeInce: boolean
  excludeComp: boolean
}

export type TOrderContractStep = {
  id: number
  min: number
  max: TMaybe<number>
  rate: number
}

export type TOrderContractProduct = {
  goodCode: string
  goodName: TMaybe<string>
  barCode: TMaybe<string>
}

export type TContractIncomeType = {
  id: number
  contractId: number
  contractType: 'ORDER' | 'BRANCH' | 'PROMO'
  incomeType: 'Bill' | 'FreeItem' | 'Invoice' | 'CreditNote'
  incomeLabelId: TMaybe<number>
  incomeLabelName: TMaybe<string>
  createdAt: string
}

export type TOrderContractDetail = TOrderContractListItem & {
  spec: TOrderContractSpec
  steps: TOrderContractStep[]
  products: TOrderContractProduct[]
  incomeTypes: TContractIncomeType[]
}

// ---------- Track B — Branch contracts ----------

export type TBranchContractSpec = {
  id: number
  maxBranches: number
  ratePerBranch: number
}

export type TBranchEntry = {
  id: number
  branchCode: string
  branchName: TMaybe<string>
  openDate: string
  closeDate: TMaybe<string>
  createdAt: string
}

export type TBranchContractListItem = TContractBase

export type TBranchContractDetail = TContractBase & {
  spec: TBranchContractSpec
  branches: TBranchEntry[]
  incomeTypes: TContractIncomeType[]
}

// ---------- Track C — Promo contracts ----------

export type TPromoContractListItem = TContractBase

export type TPromoContractDetail = TContractBase & {
  incomeTypes: TContractIncomeType[]
}

// ---------- Shared — income entries ----------

export type TIncomeEntryType = 'AUTO' | 'CN_CORRECTION' | 'LAG_CORRECTION' | 'MANUAL_CORRECTION'

export type TIncomeEntry = {
  id: number
  contractId: number
  contractType: 'ORDER' | 'BRANCH' | 'PROMO'
  entryType: TIncomeEntryType
  month: string
  orderAmount: TMaybe<number>
  amount: number
  note: TMaybe<string>
  settlementId: TMaybe<number>
  createdAt: string
}

// ---------- Track A — income entry corrections ----------

export type TCnCorrectionItem = { goodCode: string; amount: number }
export type TLagCorrectionItem = { orderNumb: string; amount: number }

export type TLagCorrectionRes = {
  monthEntry: TIncomeEntry
  nextMonthEntry: TIncomeEntry
}

export type TPostCnCorrectionReq = {
  contractId: number
  month: string
  items: TCnCorrectionItem[]
  note?: string
}

export type TPostLagCorrectionReq = {
  contractId: number
  month: string
  items: TLagCorrectionItem[]
}

type TPostOrderCorrection = {
  contractId: number
  contractType: 'ORDER'
  month: string
  orderAmount: number
  note?: string
}

type TPostBranchCorrection = {
  contractId: number
  contractType: 'BRANCH'
  month: string
  amount: number
  note?: string
}

type TPostPromoCorrection = {
  contractId: number
  contractType: 'PROMO'
  month: string
  amount: number
  note?: string
}

export type TPostManualCorrectionReq = TPostOrderCorrection | TPostBranchCorrection | TPostPromoCorrection

// ---------- Shared — settlement detail rows ----------

export type TBillDiscountRow = {
  id: number
  orderNumb: string
  receNumb: string
  subtotalAmount: number
  remark: string
}

export type TFreeItemRow = {
  id: number
  orderNumb: string
  receNumb: string
  goodCode: string
  subtotalAmount: number
  remark: string
}

export type TOtherIncomeInvoice = {
  id: number
  invoiceNumb: string
  invoiceAmount: number
  invoiceDate: string
  invoiceRemark: string
}

export type TOtherIncomeReceipt = {
  id: number
  receNumb: string
  receAmount: number
  receDate: string
  receRemark: string
}

export type TOtherIncomeCreditNote = {
  id: number
  creditNumb: string
  creditAmount: number
  creditDate: string
  creditRemark: string
}

export type TOtherIncomeMatching = {
  id: number
  invoiceId: number
  receiptId: number
  matchedAmount: number
}

// ---------- Shared — settlements ----------

export type TSettlementListItem = {
  id: number
  contractId: number
  contractType: 'ORDER' | 'BRANCH' | 'PROMO'
  periodName: string
  startDate: string
  endDate: string
  systemOrderAmount: TMaybe<number>
  cnOrderAmount: TMaybe<number>
  systemIncome: number
  supplierOrderAmount: TMaybe<number>
  supplierIncome: number
  cumulativeOrderAtClose: TMaybe<number>
  remark: TMaybe<string>
  createdAt: string
}

export type TSettlementDetail = TSettlementListItem & {
  billDiscounts: TBillDiscountRow[]
  freeItems: TFreeItemRow[]
  invoices: TOtherIncomeInvoice[]
  receipts: TOtherIncomeReceipt[]
  creditNotes: TOtherIncomeCreditNote[]
  matches: TOtherIncomeMatching[]
}

export type TSettlementOverviewItem = {
  id: number
  contractId: number
  contractType: 'ORDER' | 'BRANCH' | 'PROMO'
  periodName: string
  startDate: string
  endDate: string
  supplierIncome: number
  appendedTotal: number
  remaining: number
  balanceState: 'OUTSTANDING' | 'SETTLED'
  reviewState: 'UNREVIEWED' | 'REVIEWED'
  /** Optional until the backend ships the incomeTypes/incomeType addition proposed in docs/api/settlement-api.md. */
  incomeTypes?: ('Bill' | 'FreeItem' | 'Invoice' | 'CreditNote')[]
}

export type TInvoiceStateRow = {
  invoiceId: number
  settlementId: number
  contractId: number
  contractType: 'ORDER' | 'BRANCH' | 'PROMO'
  compCode: string
  compType: string
  compName: string
  contractLabelName: string
  invoiceNumb: string
  invoiceAmount: number
  matchedAmount: number
  invoiceState: 'UNMATCHED' | 'MATCHED'
}

// ---------- Report ----------

export type TAccrualStateRow = {
  contractId: number
  contractType: 'ORDER' | 'BRANCH' | 'PROMO'
  month: string
  netOrderAmount: TMaybe<number>
  estimateIncome: TMaybe<number>
}

// ---------- Request bodies ----------

export type TContractStep = { min: number; max: TMaybe<number>; rate: number }

export type TIncomeTypeEntry = {
  incomeType: 'Bill' | 'FreeItem' | 'Invoice' | 'CreditNote'
  incomeLabelId?: number | null
}

export type TCreateOrderContractSpec = {
  calcType: TCalcType
  capAmount: TMaybe<number>
  excludeVat: boolean
  excludeDc: boolean
  excludeRebate: boolean
  excludeInce: boolean
  excludeComp: boolean
}

export type TCreateOrderContractReq = {
  compCode: string
  compType: 'DN' | 'HU'
  contractLabelId: number
  settlementPeriod: number
  startDate: string
  endDate: string
  supplierPairId?: TMaybe<number>
  spec: TCreateOrderContractSpec
  steps: TContractStep[]
  productGoodCodes: string[]
  incomeTypes: TIncomeTypeEntry[]
}

export type TCreatePairedOrderContractReq = Omit<TCreateOrderContractReq, 'compCode' | 'compType'> & {
  supplierPairId: number
}

export type TUpdateOrderContractHeaderReq = {
  contractLabelId: number
  settlementPeriod: number
  startDate: string
  endDate: string
  supplierPairId?: TMaybe<number>
}

export type TUpdateOrderContractSpecReq = {
  calcType: TCalcType
  capAmount: TMaybe<number>
  excludeVat: boolean
  excludeDc: boolean
  excludeRebate: boolean
  excludeInce: boolean
  excludeComp: boolean
  steps: TContractStep[]
}

export type TCreateBranchContractReq = {
  compCode: string
  compType: 'DN' | 'HU'
  contractLabelId: number
  settlementPeriod: number
  startDate: string
  endDate: string
  maxBranches: number
  ratePerBranch: number
  incomeTypes: TIncomeTypeEntry[]
}

export type TUpdateBranchContractSpecReq = { maxBranches: number; ratePerBranch: number }

export type TCreatePromoContractReq = {
  compCode: string
  compType: 'DN' | 'HU'
  contractLabelId: number
  settlementPeriod: number
  startDate: string
  endDate: string
  incomeTypes: TIncomeTypeEntry[]
}

export type TUpdatePromoContractReq = {
  contractLabelId: number
  settlementPeriod: number
  startDate: string
  endDate: string
}

export type TAddBranchReq = { branchCode: string; openDate: string }
export type TCloseBranchReq = { closeDate: string }

export type TBranchSearchResult = { branchCode: string; branchName: string }

export type TPostPromoAccrualReq = { month: string; amount: number }

export type TPostBillDiscountReq = { orderNumb: string; receNumb: string; subtotalAmount: number; remark: string }
export type TPostFreeItemReq = { orderNumb: string; receNumb: string; goodCode: string; subtotalAmount: number; remark: string }

export type TDiscType = 'Dc' | 'Rebate' | 'Ince' | 'Compensate' | 'Cash' | 'All'
export type TItemRema = 'Dc' | 'Rebate' | 'Ince' | 'Compensation' | 'Promotion' | 'Charge' | 'Others' | 'All'

export type TDateRange = { start: string | null; end: string | null }

export type TBillDiscountSearchParams = {
  compType: 'DN' | 'HU'
  compCode: string
  discType: TDiscType
  order: string | null
  orderDateRange: TDateRange
}

export type TFreeItemSearchParams = {
  compType: 'DN' | 'HU'
  compCode: string
  itemRema: TItemRema
  order: string | null
  orderDateRange: TDateRange
}

/** One row per (orderNumb, receNumb) — see GET /v2/master/bill-discounts in master-api.md. */
export type TBillDiscountOrderLine = {
  orderNumb: string
  receNumb: string
  billNumb: string
  billDate: string
  receDate: string
  incentiveAmount: number
  remark: string
}

/** One row per (orderNumb, receNumb, goodCode) — see GET /v2/master/free-products in master-api.md. */
export type TFreeItemOrderLine = {
  orderNumb: string
  receNumb: string
  billNumb: string
  billDate: string
  receDate: string
  goodCode: string
  goodName: string
  barCode: string
  incentiveAmount: number
  remark: string
}
export type TPostInvoiceReq = { invoiceNumb: string; invoiceAmount: number; invoiceDate: string; invoiceRemark: string }
export type TPostReceiptReq = { receNumb: string; receAmount: number; receDate: string; receRemark: string }
export type TPostMatchReq = { invoiceId: number; receiptId: number; matchedAmount: number }
export type TPostCreditNoteReq = { creditNumb: string; creditAmount: number; creditDate: string; creditRemark: string }

export type TPostSettlementReq = {
  contractId: number
  contractType: 'ORDER' | 'BRANCH' | 'PROMO'
  periodName: string
  startDate: string
  endDate: string
  supplierOrderAmount?: number
  incomeEntryIds: number[]
  supplierOrders?: { orderNumb: string; orderAmount: number; note?: string }[]
  billDiscounts?: TPostBillDiscountReq[]
  freeItems?: TPostFreeItemReq[]
  invoices?: TPostInvoiceReq[]
  receipts?: TPostReceiptReq[]
  invoiceReceiptMatches?: TPostMatchReq[]
  creditNotes?: TPostCreditNoteReq[]
  remark?: string
}

export type TAccrualStateParams = {
  contractType: 'order' | 'branch' | 'promo'
  contractId?: number
  monthFrom?: string
  monthTo?: string
}

// ---------- Legacy types kept for accounting module compatibility ----------

/** @deprecated use TContractLabel */
export type TOtherIncomeEvent = TContractLabel

/** @deprecated use TIncomeLabel */
export type TOtherIncomeIncome = TIncomeLabel
