import { HttpErrorResponse } from '@angular/common/http';
import { TGateBoard, TReceivingBoard, TReceivingSettings, TReceivingWindow, TVisit } from '../types/receiving.type';
import {
  apiErrorMessage,
  buildTimeline,
  GATE_TYPE_BY_SIZE,
  GATE_TYPE_LABEL,
  gateTypeOf,
  isSuggestedGate,
  preferredGateTypeOf,
  busyGates,
  classifyBills,
  companiesLabel,
  freeGates,
  minutesLabel,
  parseBillCount,
} from './receiving.util';

const SETTINGS: TReceivingSettings = {
  warehouseCode: 'BMS', warehouseName: 'คลัง', sizeMMinBills: 2, sizeLMinBills: 6, sizeLUnits: 2,
  onTimeToleranceMinutes: 30, busyTruckThreshold: 5,
}

const gate = (id: number, over: Partial<TGateBoard> = {}): TGateBoard =>
  ({ id, gateName: String(id), isActive: true, unloading: [], ...over })

describe('receiving.util', () => {
  it('classifyBills follows the settings cut points', () => {
    expect([1, 2, 5, 6, 30].map(n => classifyBills(n, SETTINGS))).toEqual(['S', 'M', 'M', 'L', 'L'])
  })

  it('apiErrorMessage reads { error } and ignores other bodies', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 400, error: { error: 'window is full' } }))).toBe('window is full')
    expect(apiErrorMessage(new HttpErrorResponse({ status: 500, error: 'boom' }))).toBeNull()
    expect(apiErrorMessage(new HttpErrorResponse({ status: 0, error: null }))).toBeNull()
    expect(apiErrorMessage(undefined)).toBeNull()
  })

  it('companiesLabel names the companies on the truck', () => {
    expect(companiesLabel({ carriesDn: true, carriesHu: true })).toBe('DN + HU')
    expect(companiesLabel({ carriesDn: true, carriesHu: false })).toBe('DN')
    expect(companiesLabel({ carriesDn: false, carriesHu: true })).toBe('HU')
  })

  it('minutesLabel switches to hours from 60', () => {
    expect(minutesLabel(null)).toBe('-')
    expect(minutesLabel(0)).toBe('0 น.')
    expect(minutesLabel(59)).toBe('59 น.')
    expect(minutesLabel(60)).toBe('1 ชม.')
    expect(minutesLabel(75)).toBe('1 ชม. 15 น.')
  })

  it('freeGates / busyGates split open gates by whether a truck is there', () => {
    const gates = [gate(7), gate(8, { unloading: [{ id: 1 } as TVisit] }), gate(9, { isActive: false })]
    expect(freeGates(gates).map(g => g.id)).toEqual([7])
    expect(busyGates(gates).map(g => g.id)).toEqual([8])
  })

  it('parseBillCount accepts whole numbers 1–200 only', () => {
    expect(parseBillCount('3')).toBe(3)
    expect(parseBillCount(200)).toBe(200)
    expect(parseBillCount('0')).toBeNull()
    expect(parseBillCount('201')).toBeNull()
    expect(parseBillCount('2.5')).toBeNull()
    expect(parseBillCount('')).toBeNull()
    expect(parseBillCount('abc')).toBeNull()
  })
})

const stub = (id: number, over: Partial<TVisit> = {}): TVisit => ({
  id, queueNo: id, source: 'WALK_IN', status: 'DONE', supplierName: 'ผู้ส่ง ' + id, billCount: 3,
  sizeClass: 'M', windowId: null, gateId: null, calledAt: null, finishedAt: null,
  ...over,
} as TVisit)

const WINDOWS: TReceivingWindow[] = [
  { id: 1, startMinute: 8 * 60, endMinute: 10 * 60, label: '08:00–10:00', capacityUnits: 6, isActive: true },
  { id: 2, startMinute: 13 * 60, endMinute: 15 * 60, label: '13:00–15:00', capacityUnits: 6, isActive: true },
]

const dayBoard = (over: Partial<TReceivingBoard> = {}): TReceivingBoard => ({
  warehouseCode: 'BMS', visitDate: '2026-11-25', serverNow: '2026-11-25T10:00:00',
  summary: { booked: 0, waiting: 0, unloading: 0, done: 0, cancelled: 0, isBusy: false },
  queue: [], gates: [], expected: [], done: [], cancelled: [],
  ...over,
})

describe('gate type suggestion', () => {
  it('maps truck size to gate type in one table', () => {
    expect(GATE_TYPE_BY_SIZE).toEqual({ L: 'LARGE', M: 'NORMAL', S: 'EXPRESS' })
    expect(GATE_TYPE_LABEL).toEqual({ LARGE: 'รถใหญ่', NORMAL: 'ทั่วไป', EXPRESS: 'ด่วน' })
  })

  it('prefers the API value, else derives it from the size class', () => {
    expect(preferredGateTypeOf({ sizeClass: 'M', preferredGateType: 'EXPRESS' })).toBe('EXPRESS')
    expect(preferredGateTypeOf({ sizeClass: 'L' })).toBe('LARGE')
    expect(preferredGateTypeOf({ sizeClass: 'S' })).toBe('EXPRESS')
  })

  it('treats a missing gateType as NORMAL', () => {
    expect(gateTypeOf({})).toBe('NORMAL')
    expect(gateTypeOf({ gateType: 'LARGE' })).toBe('LARGE')
  })

  it('suggests gates whose type equals the preferred type, and only those', () => {
    const large = { sizeClass: 'L', preferredGateType: 'LARGE' } as const
    expect(isSuggestedGate(large, { gateType: 'LARGE' })).toBeTrue()
    expect(isSuggestedGate(large, { gateType: 'NORMAL' })).toBeFalse()
    expect(isSuggestedGate({ sizeClass: 'M' }, {})).toBeTrue()
  })
})

describe('buildTimeline', () => {
  it('spans the earliest window start to 17:00 with a tick every 30 minutes', () => {
    const t = buildTimeline(dayBoard(), WINDOWS)
    expect(t.startMinute).toBe(480)
    expect(t.endMinute).toBe(1020)
    expect(t.ticks.length).toBe(19)
    expect(t.ticks[0]).toEqual({ minute: 480, label: '08:00', leftPct: 0 })
    expect(t.ticks[18].leftPct).toBe(100)
  })

  it('extends the axis past 17:00 when a window ends later', () => {
    const t = buildTimeline(dayBoard(), [{ ...WINDOWS[0], endMinute: 18 * 60 + 10 }])
    expect(t.endMinute).toBe(18 * 60 + 30)
  })

  it('draws a done visit from called to finished by percentage', () => {
    const done = stub(5, { gateId: 8, calledAt: '2026-11-25T09:00:00', finishedAt: '2026-11-25T10:00:00' })
    const t = buildTimeline(dayBoard({ done: [done], gates: [{ id: 8, gateName: '8', isActive: true, gateType: 'NORMAL', unloading: [] }] }), WINDOWS)
    const bar = t.gates[0].bars[0]
    expect(bar.leftPct).toBeCloseTo(60 / 540 * 100)
    expect(bar.widthPct).toBeCloseTo(60 / 540 * 100)
    expect(bar.inProgress).toBeFalse()
    expect(bar.shortName).toBe('ผู้ส่ง 5')
    expect(bar.detail).toContain('09:00–10:00')
    expect(bar.detail).toContain('3 บิล')
  })

  it('runs an unloading visit up to serverNow and marks it in progress', () => {
    const live = stub(3, { status: 'UNLOADING', gateId: 7, calledAt: '2026-11-25T09:30:00' })
    const t = buildTimeline(dayBoard({ gates: [{ id: 7, gateName: '7', isActive: true, unloading: [live] }] }), WINDOWS)
    const bar = t.gates[0].bars[0]
    expect(bar.inProgress).toBeTrue()
    expect(bar.widthPct).toBeCloseTo(30 / 540 * 100)
    expect(t.nowPct).toBeCloseTo(120 / 540 * 100)
  })

  it('clamps bars to the axis and drops those outside it', () => {
    const early = stub(1, { gateId: 8, calledAt: '2026-11-25T07:00:00', finishedAt: '2026-11-25T08:30:00' })
    const late = stub(2, { gateId: 8, calledAt: '2026-11-25T16:30:00', finishedAt: '2026-11-25T18:30:00' })
    const gone = stub(4, { gateId: 8, calledAt: '2026-11-25T05:00:00', finishedAt: '2026-11-25T06:00:00' })
    const t = buildTimeline(dayBoard({ done: [early, late, gone], gates: [{ id: 8, gateName: '8', isActive: true, unloading: [] }] }), WINDOWS)
    const [first, second] = t.gates[0].bars
    expect(t.gates[0].bars.length).toBe(2)
    expect(first.leftPct).toBe(0)
    expect(first.widthPct).toBeCloseTo(30 / 540 * 100)
    expect(second.leftPct + second.widthPct).toBeCloseTo(100)
  })

  it('puts overlapping bars of a doubled-up gate in separate lanes', () => {
    const a = stub(1, { status: 'UNLOADING', calledAt: '2026-11-25T09:00:00' })
    const b = stub(2, { status: 'UNLOADING', calledAt: '2026-11-25T09:20:00' })
    const t = buildTimeline(dayBoard({ gates: [{ id: 8, gateName: '8', isActive: true, unloading: [a, b] }] }), WINDOWS)
    expect(t.gates[0].bars.map(x => x.lane)).toEqual([0, 1])
    expect(t.gates[0].laneCount).toBe(2)
  })

  it('falls back to NORMAL for gates without gateType and keeps API order', () => {
    const t = buildTimeline(dayBoard({
      gates: [
        { id: 11, gateName: '11', isActive: true, gateType: 'EXPRESS', unloading: [] },
        { id: 7, gateName: '7', isActive: true, unloading: [] },
      ],
    }), WINDOWS)
    expect(t.gates.map(g => [g.gateId, g.gateType])).toEqual([[11, 'EXPRESS'], [7, 'NORMAL']])
  })

  it('shows each booking window with booked and remaining counts', () => {
    const waiting = stub(1, { source: 'BOOKED', status: 'WAITING', windowId: 1 })
    const expected = stub(2, { source: 'BOOKED', status: 'BOOKED', windowId: 1, queueNo: null })
    const walkIn = stub(3, { windowId: null })
    const other = stub(4, { source: 'BOOKED', status: 'BOOKED', windowId: 2, queueNo: null })
    const t = buildTimeline(dayBoard({ queue: [waiting, walkIn], expected: [expected, other] }), WINDOWS)
    expect(t.bookings.map(b => [b.windowId, b.bookedCount, b.remainingCount])).toEqual([[1, 2, 1], [2, 1, 1]])
    expect(t.bookings[0].leftPct).toBe(0)
    expect(t.bookings[0].widthPct).toBeCloseTo(120 / 540 * 100)
  })

  it('has no now-line when the board is not today', () => {
    const t = buildTimeline(dayBoard({ visitDate: '2026-11-24' }), WINDOWS)
    expect(t.nowPct).toBeNull()
  })
})
