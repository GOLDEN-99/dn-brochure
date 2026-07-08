export const INCOME_TYPE_LABEL: Record<'Bill' | 'FreeItem' | 'Invoice' | 'CreditNote', string> = {
  Invoice: 'ใบแจ้งหนี้',
  CreditNote: 'CN',
  Bill: 'CN มากับบิล',
  FreeItem: 'สินค้าแถม',
}

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
