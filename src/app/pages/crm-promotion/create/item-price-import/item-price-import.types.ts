// Mirrors docs/crm-item-price-import-api-spec.md exactly. Do not add fields the API does not
// return; the backend is built against the same document.

export type TItemPriceSource = 'HU' | 'SUPPLIER' | 'BOTH'

export type TResolveRowStatus = 'OK' | 'SKIP' | 'ERROR'

/** Reasons the server sets. */
export type TServerReasonCode =
  | 'BARCODE_NOT_FOUND'
  | 'AMBIGUOUS_CODE'
  | 'GOOD_INACTIVE'
  | 'NO_BASE_UNIT_BARCODE'
  | 'UNIT_NOT_SOLD'
  | 'NO_BRANCH_ABOVE_PRICE'
  | 'UNIT_UNPRICED'

/** Reasons the client sets before calling resolve; those rows are never sent. */
export type TClientReasonCode = 'DUPLICATE_IN_FILE' | 'INVALID_PRICE' | 'EMPTY_BARCODE'

export type TReasonCode = TServerReasonCode | TClientReasonCode

export type TMatchedBy = 'GOODINFO' | 'GOODBARCODE'

export type TOverlapOutcome = 'EXISTING_WINS' | 'NEW_WINS' | 'STACKS' | 'EXISTING_SETTLES_GROUP'

export type TItemPriceRequestStatus = 'QUEUED' | 'ISSUING' | 'ISSUED' | 'ISSUED_WITH_SKIPS' | 'FAILED'

export type TItemPriceLine = {
  rowNumber: number
  barcode: string
  price: number
  name: string | null
  /**
   * The units of this row to keep, when the server split it into one row per unit and the user
   * dropped some (CRM-PROMOTION-UNIT-PLAN.md §1.5). Omitted = every unit the good is sold in.
   */
  unitCodes?: string[]
}

/** The (sheet row, unit) fields a resolved row and a stored line share. */
export type TLineUnit = {
  /** GoodBarcode.unitCode of this row's unit; null on an ERROR row. */
  unitCode: string | null
  unitDesc: string | null
  unitFactor: number | null
  /** 1..splitCount; a sheet row whose good is sold in N units comes back as N rows. */
  splitSeq: number
  splitCount: number
}

export type TResolveRequest = {
  startDate: string
  endDate: string
  /** Optional; sharpens the overlap `outcome` against the header's order (omitted = 0). */
  promotionOrder?: number
  lines: TItemPriceLine[]
}

export type TPriceLadder = {
  price1: number
  price2: number
  price3: number
  price4: number
  price5: number
  price6: number
  priceA: number
  priceB: number
  priceC: number
}

export type TLadderKey = keyof TPriceLadder

export type TResolvedLevel = {
  level: string
  memberPrice: number
  walkInPrice: number | null
  branchCount: number
  /** Member price at this level is strictly above the promo price. */
  qualifies: boolean
  /** The promotion is created for this level: highest qualifying level + 1, capped at 6 (walk-in step). */
  inScope: boolean
}

export type TOverlappingPromotion = {
  id: number
  promotionName: string
  action: string
  rewardValue: number
  promotionPriority: number
  promotionOrder: number
  startDate: string
  endDate: string
  outcome: TOverlapOutcome
}

export type TResolvedLine = TItemPriceLine & TLineUnit & {
  status: TResolveRowStatus
  reasonCode: TReasonCode | null
  reason: string | null
  matchedBy: TMatchedBy | null
  goodCode: string | null
  goodName: string | null
  competitiveGroup: string
  /** The unit's own scan barcode (a pack unit has no 6-digit code). */
  unitBarcode: string | null
  /** THIS unit's ladder: a pack row carries the pack's own total price. */
  ladder: TPriceLadder | null
  levels: TResolvedLevel[] | null
  branchesAbove: number
  branchesBelow: number
  /** Branches the promotion will be created for (>= branchesAbove). */
  branchesInScope: number
  /** Promotions on the same (good, unit) only; one not yet backfilled lists against every unit. */
  overlapping: TOverlappingPromotion[]
}

export type TResolveSummary = {
  total: number
  ok: number
  skip: number
  error: number
}

export type TResolveResponse = {
  rows: TResolvedLine[]
  summary: TResolveSummary
}

export type TCreateItemPriceRequest = {
  name: string
  startDate: string
  endDate: string
  source: TItemPriceSource
  promotionOrder: number
  activeDay: string
  createdBy?: string
  lines: TItemPriceLine[]
}

export type TItemPriceRequestLine = TItemPriceLine & TLineUnit & {
  id: number
  goodCode: string | null
  goodName: string | null
  resolveStatus: TResolveRowStatus
  reasonCode: TReasonCode | null
  reason: string | null
  promotionId: number | null
  ladder: TPriceLadder | null
}

export type TItemPriceRequestSummary = {
  id: number
  name: string
  startDate: string
  endDate: string
  source: TItemPriceSource
  status: TItemPriceRequestStatus
  createdBy: string
  createdAt: string
  issuedCount: number
  skippedCount: number
  totalCount: number
}

export type TItemPriceRequestDetail = TItemPriceRequestSummary & {
  promotionOrder: number
  activeDay: string
  issueStartedAt: string | null
  issueFinishedAt: string | null
  issueError: string | null
  lines: TItemPriceRequestLine[]
}

/** 400 body shape shared by the CRM endpoints. */
export type TApiValidationError = {
  error: string
  statusCode: number
  message: string
  errors?: Record<string, string[]>
}

export const TERMINAL_STATUSES: readonly TItemPriceRequestStatus[] = ['ISSUED', 'ISSUED_WITH_SKIPS', 'FAILED']

export function isTerminalStatus(status: TItemPriceRequestStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

export const OVERLAP_OUTCOME_LABEL: Record<TOverlapOutcome, string> = {
  EXISTING_WINS: 'โปรเดิมชนะ',
  NEW_WINS: 'โปรใหม่ชนะ',
  STACKS: 'ซ้อนกัน',
  EXISTING_SETTLES_GROUP: 'โปรเดิม priority สูงกว่า ปิดกลุ่ม',
}

export const REQUEST_STATUS_LABEL: Record<TItemPriceRequestStatus, string> = {
  QUEUED: 'รอคิว',
  ISSUING: 'กำลังออกโปร',
  ISSUED: 'ออกโปรแล้ว',
  ISSUED_WITH_SKIPS: 'ออกโปรแล้ว (มีข้าม)',
  FAILED: 'ล้มเหลว',
}

/** Shown on a row the server split into one row per unit the good is sold in. */
export const splitLabel = (splitCount: number): string => `เพิ่ม ${splitCount} แถวจาก 1`

export const CLIENT_REASON_LABEL: Record<TClientReasonCode, string> = {
  EMPTY_BARCODE: 'บาร์โค้ดว่าง',
  INVALID_PRICE: 'ราคาไม่ถูกต้อง (ตัวเลข >= 0 ไม่เกิน 2 ตำแหน่ง)',
  DUPLICATE_IN_FILE: 'บาร์โค้ดซ้ำในไฟล์',
}
