export const INCOME_TYPE_LABEL: Record<'Bill' | 'FreeItem' | 'Invoice' | 'CreditNote', string> = {
  Invoice: 'ใบแจ้งหนี้',
  CreditNote: 'CN',
  Bill: 'CN มากับบิล',
  FreeItem: 'สินค้าแถม',
}

/**
 * Joins a contract's configured income types into one cell value (วิธีรับรู้ —
 * how the supplier settles this contract). Falls back to the generic income
 * type label when a row has no custom `incomeLabelName`, so a configured
 * income type is never rendered as a blank entry in the list.
 */
export const formatIncomeTypes = (
  incomeTypes: ReadonlyArray<{ incomeType: keyof typeof INCOME_TYPE_LABEL; incomeLabelName: string | null }> | null | undefined
): string =>
  (incomeTypes ?? [])
    .map(t => t.incomeLabelName ?? INCOME_TYPE_LABEL[t.incomeType] ?? t.incomeType)
    .join(', ')

export const CONTRACT_TYPE_LABEL: Record<'ORDER' | 'BRANCH' | 'PROMO', string> = {
  ORDER: 'DC Rebate',
  BRANCH: 'Light Box',
  PROMO: 'อื่นๆ',
}

export const CONTRACT_TYPE_PATH: Record<'ORDER' | 'BRANCH' | 'PROMO', string> = {
  ORDER: 'order',
  BRANCH: 'branch',
  PROMO: 'promo',
}

export const BALANCE_STATE_LABEL: Record<'OUTSTANDING' | 'SETTLED', string> = {
  OUTSTANDING: 'รอรับรู้',
  SETTLED: 'รับรู้แล้ว',
}

export const REVIEW_STATE_LABEL: Record<'UNREVIEWED' | 'REVIEWED', string> = {
  UNREVIEWED: 'รอ audit',
  REVIEWED: 'audit แล้ว',
}

export const COMP_TYPE_LABEL: Record<'DN' | 'HU', string> = {
  DN: 'DN',
  HU: 'HU',
}
