// Shapes of other-income-api `/inbound-outbound` (InboundOutbound/docs/receiving-slot-api.md).

export type TCompType = 'DN' | 'HU'
export type TVisitStatus = 'BOOKED' | 'WAITING' | 'UNLOADING' | 'DONE' | 'CANCELLED'
export type TVisitSource = 'BOOKED' | 'WALK_IN'
export type TSizeClass = 'S' | 'M' | 'L'
export type TPunctuality = 'EARLY' | 'ON_TIME' | 'LATE'
/** LARGE = big loads, NORMAL = interchangeable, EXPRESS = one-bill trucks. Older API builds omit it (read as NORMAL). */
export type TGateType = 'LARGE' | 'NORMAL' | 'EXPRESS'

// ── config ──

export type TReceivingSettings = {
  warehouseCode: string
  warehouseName: string
  sizeMMinBills: number
  sizeLMinBills: number
  sizeLUnits: number
  onTimeToleranceMinutes: number
  busyTruckThreshold: number
}

export type TReceivingGate = {
  id: number
  gateName: string
  sortOrder: number
  gateType?: TGateType
  isActive: boolean
  note: string | null
}

export type TReceivingWindow = {
  id: number
  startMinute: number
  endMinute: number
  label: string
  capacityUnits: number
  isActive: boolean
}

export type TReceivingConfig = {
  settings: TReceivingSettings
  gates: TReceivingGate[]
  windows: TReceivingWindow[]
}

// ── visits ──

export type TVisitOrder = {
  compType: TCompType
  orderNumb: string
}

export type TVisit = {
  id: number
  warehouseCode: string
  visitDate: string
  queueNo: number | null
  source: TVisitSource
  status: TVisitStatus
  supplierName: string
  compCode: string | null
  compType: TCompType | null
  carriesDn: boolean
  carriesHu: boolean
  billCount: number
  sizeClass: TSizeClass
  preferredGateType?: TGateType
  units: number
  windowId: number | null
  windowLabel: string | null
  punctuality: TPunctuality | null
  hasPriority: boolean
  queuePosition: number | null
  truckPlate: string | null
  driverPhone: string | null
  note: string | null
  gateId: number | null
  gateName: string | null
  arrivedAt: string | null
  calledAt: string | null
  finishedAt: string | null
  waitMinutes: number | null
  unloadMinutes: number | null
  cancelReason: string | null
  orders: TVisitOrder[]
}

export type TGateBoard = {
  id: number
  gateName: string
  isActive: boolean
  gateType?: TGateType
  unloading: TVisit[]
}

export type TBoardSummary = {
  booked: number
  waiting: number
  unloading: number
  done: number
  cancelled: number
  isBusy: boolean
}

export type TReceivingBoard = {
  warehouseCode: string
  visitDate: string
  serverNow: string
  summary: TBoardSummary
  queue: TVisit[]
  gates: TGateBoard[]
  expected: TVisit[]
  done: TVisit[]
  cancelled: TVisit[]
}

// ── requests ──

export type TWalkInCheckInReq = {
  warehouseCode: string
  supplierName: string
  compCode: string | null
  compType: TCompType | null
  carriesDn: boolean
  carriesHu: boolean
  billCount: number
  truckPlate: string | null
  driverPhone: string | null
  note: string | null
  orders: TVisitOrder[]
  checkedInBy: string | null
}

/** What the walk-in form emits; the page adds the warehouse and the employee. */
export type TWalkInDraft = Omit<TWalkInCheckInReq, 'warehouseCode' | 'checkedInBy'>

export type TBookedCheckInReq = {
  billCount: number
  truckPlate: string | null
  checkedInBy: string | null
}

export type TSupplierHit = {
  compCode: string
  compName: string
  compType: TCompType
}

// ── timeline view (built by buildTimeline in receiving.util.ts) ──

export type TTimelineTick = { minute: number, label: string, leftPct: number }

export type TTimelineBar = {
  visitId: number
  queueNo: number | null
  supplierName: string
  /** Supplier name cut to fit a bar; the full text is in `detail`. */
  shortName: string
  leftPct: number
  widthPct: number
  /** Row of the bar inside its gate when two trucks overlap (a doubled-up gate). */
  lane: number
  inProgress: boolean
  /** Full text for title / aria-label: supplier, bills, times. */
  detail: string
}

export type TTimelineGateRow = {
  gateId: number
  gateName: string
  gateType: TGateType
  isActive: boolean
  laneCount: number
  bars: TTimelineBar[]
}

export type TTimelineBooking = {
  windowId: number
  label: string
  leftPct: number
  widthPct: number
  /** Booked visits of this window that are not cancelled. */
  bookedCount: number
  /** Booked trucks of this window that have not arrived yet. */
  remainingCount: number
}

export type TTimelineModel = {
  startMinute: number
  endMinute: number
  /** Width of 30 minutes in percent, for the grid lines. */
  tickPct: number
  ticks: TTimelineTick[]
  bookings: TTimelineBooking[]
  gates: TTimelineGateRow[]
  /** Null unless the board is today's. */
  nowPct: number | null
}
