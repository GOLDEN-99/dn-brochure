import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap"

export type TOtherIncomeEvent = {
  id: number
  eventName: string
  eventType: number
}

export type TDateRangeFormState = {
  startDate: NgbDateStruct,
  endDate: NgbDateStruct
}


export type TOtherIncomeIncome = {
  id: number
  incomeName: string
  incomeType: number
}

export type TOtherIncomeCreateInvoice = {
  invNumb: string
  invDate: string
  invAmount: number
  invRemark: string
}

export type TOtherIncomeInvoice = TOtherIncomeCreateInvoice & { id: number, checkDate: string | null, matchedAmount: number, remainingAmount: number }

export type TOtherIncomeMatching = { invoiceId: number, receiptId: number, matchedAmount: number }

export type TOtherIncomeMatchOnCreate = Pick<TOtherIncomeMatching, 'invoiceId' | 'matchedAmount'>

export type TOtherIncomeCreateReceipt = {
  receNumb: string
  receDate: string
  receAmount: number
  receRemark: string
  invoiceMatches: TOtherIncomeMatchOnCreate[]
}

export type TOtherIncomeReceipt = Omit<TOtherIncomeCreateReceipt, 'invoiceMatches'> & { id: number, checkDate: string | null, matchedAmount: number, remainingAmount: number }

export type TOtherIncomeCreateCreditNote = {
  creditNumb: string
  creditDate: string
  creditAmount: number
  creditRemark: string
}

export type TOtherIncomeCreditNote = TOtherIncomeCreateCreditNote & { id: number, checkDate: string | null }

export type TOtherIncomeCompany = {
  compCode: string;
  compName: string;
  compType: string;
  compName2: string;
  compGroupCode: string;
}

export const STEP_TYPE = {
  flat: 1,
  step: 2,
  cumulative: 3
} as const

export type TOtherIncomeStepType = keyof typeof STEP_TYPE

export const COMP_TYPE = {
  dn: 'DN',
  hu: 'HU',
}

export type TOtherIncomeCompType = keyof typeof COMP_TYPE