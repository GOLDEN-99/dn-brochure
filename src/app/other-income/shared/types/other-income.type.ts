export type TOtherIncomeEvent = {
  id: number
  eventName: string
  eventType: number
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
  matches: TOtherIncomeMatchOnCreate[]
}

export type TOtherIncomeReceipt = Omit<TOtherIncomeCreateReceipt, 'matches'> & { id: number, checkDate: string | null, matchedAmount: number, remainingAmount: number }

export type TOtherIncomeCreateCreditNote = {
  creditNumb: string
  creditDate: string
  creditAmount: number
  creditRemark: string
}

export type TOtherIncomeCreditNote = TOtherIncomeCreateCreditNote & { id: number, checkDate: string | null }