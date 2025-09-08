export type TAccountReportQuery = {
    compType: number
    day: number
    month: number
    year: number
}

export type TBaseQuery = {
    compType: string
}

export type TQueryWithYear = { year: string } & TBaseQuery
export type TQueryWithMonth = { month: string } & TBaseQuery
export type TQueryWithRange = { startDate: string, endDate: string } & TBaseQuery

export type TBaseReport = {
    displayName: string
    compCode: string
    compType: string
    compName: string
    eventName: string
    incomeName: string
}

export type TInvocieReport = {
    id: number
    periodId: number
    periodName: string
    periodStart: string
    periodEnd: string
    totalAmount: number
    totalIncome: number
} & TBaseReport

export type TReceiptReport = {
    invNumb: string
    invAmount: number
    invDate: string
    invRemark: string
} & TInvocieReport

export type TAnnualReport = {}

export type TLightBoxReport = {
    displayName: string
    compCode: string
    compName: string
    compType: string
    branchCode: string
    branchName: string
    incomeName: string
    eventName: string
    periodName: string
    periodStart: string
    periodEnd: string
    totalAmount: number
    totalIncome: number
}

export type TAnnaulReportItem = {
    totalAmount: number
    totalIncome: number
    orderAmount: number
    creditAmount: number
    invAmount: number
    receAmount: number
}

export type TAnnualIncomeReport = {
    id: number
    period: number
    startDate: string
    endDate: string
    q1: TAnnaulReportItem
    q2: TAnnaulReportItem
    q3: TAnnaulReportItem
    q4: TAnnaulReportItem
    h1: TAnnaulReportItem
    h2: TAnnaulReportItem
    y: TAnnaulReportItem
} & TBaseReport

export type TMonthBuyReport = {
    incVat: boolean
    isDc: boolean
    isRebate: boolean
    isInce: boolean
    isComp: boolean
    receNumb: string
    receDate: string
    billNumb: string
    billDate: string
    totalCost: number
    totalVat: number
    dcDisc: number
    rebateDisc: number
    inceDisc: number
    compDisc: number
    subtotal: number
    calAmount: number
    cn: number
    actualAmount: number
    reason: string
    incomeAmount: number
} & TBaseReport

export type TMonthInceReport = {
    incomeRemark: string
    incomeAmount: number
    startDate: string
    endDate: string
} & TBaseReport

export type TRangeBillReport = {
    remark: string
    subtotal: number
    orderNumb: string
    receNumb: string
} & TInvocieReport

export type TRangeCreditReport = {
    creditNumb: string
    creditDate: string
    creditAmount: number
    creditRemark: string
} & TInvocieReport

export type TRangeInvReceReport = {
    receNumb: string
    receDate: string
    receAmount: string
    receRemark: string
} & TReceiptReport