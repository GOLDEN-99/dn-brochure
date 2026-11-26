import { HttpErrorResponse } from '@angular/common/http';
import {
  TGateBoard,
  TGateType,
  TPunctuality,
  TReceivingBoard,
  TReceivingSettings,
  TReceivingWindow,
  TSizeClass,
  TTimelineBar,
  TTimelineBooking,
  TTimelineGateRow,
  TTimelineModel,
  TTimelineTick,
  TVisit,
} from '../types/receiving.type';

/** The API answers a refused request with `{ error: "..." }` (400 and 409). */
export function apiErrorMessage(err: unknown): string | null {
  const body = (err as HttpErrorResponse | undefined)?.error as { error?: unknown } | string | null | undefined
  if (!body || typeof body === 'string') return null
  return typeof body.error === 'string' && body.error ? body.error : null
}

/** Same cut points the API applies (`ReceivingRules.Classify`), for the form's live preview only. */
export function classifyBills(billCount: number, settings: TReceivingSettings): TSizeClass {
  if (billCount >= settings.sizeLMinBills) return 'L'
  if (billCount >= settings.sizeMMinBills) return 'M'
  return 'S'
}

export const SIZE_LABEL: Record<TSizeClass, string> = {
  S: 'เล็ก',
  M: 'กลาง',
  L: 'ใหญ่',
}

export const PUNCTUALITY_LABEL: Record<TPunctuality, string> = {
  EARLY: 'มาก่อนเวลา',
  ON_TIME: 'ตรงเวลา',
  LATE: 'มาช้า',
}

export function companiesLabel(visit: Pick<TVisit, 'carriesDn' | 'carriesHu'>): string {
  if (visit.carriesDn && visit.carriesHu) return 'DN + HU'
  return visit.carriesDn ? 'DN' : visit.carriesHu ? 'HU' : '-'
}

/** 75 → "1 ชม. 15 น."; null → "-". */
export function minutesLabel(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return '-'
  if (minutes < 60) return `${minutes} น.`
  const rest = minutes % 60
  return rest === 0 ? `${Math.floor(minutes / 60)} ชม.` : `${Math.floor(minutes / 60)} ชม. ${rest} น.`
}

/** Open gates with no truck first — those are the ones to send the next truck to. */
export function freeGates(gates: TGateBoard[]): TGateBoard[] {
  return gates.filter(g => g.isActive && g.unloading.length === 0)
}

export function busyGates(gates: TGateBoard[]): TGateBoard[] {
  return gates.filter(g => g.isActive && g.unloading.length > 0)
}

/** Bill count typed into a number box: whole number 1–200, else null. */
export function parseBillCount(raw: string | number | null | undefined): number | null {
  const n = typeof raw === 'number' ? raw : Number(String(raw ?? '').trim())
  return Number.isInteger(n) && n >= 1 && n <= 200 ? n : null
}

// ── gate types ──

export const GATE_TYPE_LABEL: Record<TGateType, string> = {
  LARGE: 'รถใหญ่',
  NORMAL: 'ทั่วไป',
  EXPRESS: 'ด่วน',
}

/** The one place that says which gate type suits which truck size (the API sends the same as `preferredGateType`). */
export const GATE_TYPE_BY_SIZE: Record<TSizeClass, TGateType> = {
  L: 'LARGE',
  M: 'NORMAL',
  S: 'EXPRESS',
}

/** A missing `gateType` (API not deployed yet) is a normal gate. */
export function gateTypeOf(gate: { gateType?: TGateType | null }): TGateType {
  return gate.gateType ?? 'NORMAL'
}

/** The API's `preferredGateType`, else derived from the size class. */
export function preferredGateTypeOf(visit: Pick<TVisit, 'sizeClass' | 'preferredGateType'>): TGateType {
  return visit.preferredGateType ?? GATE_TYPE_BY_SIZE[visit.sizeClass] ?? 'NORMAL'
}

/** A hint only: every gate stays selectable. */
export function isSuggestedGate(
  visit: Pick<TVisit, 'sizeClass' | 'preferredGateType'>,
  gate: { gateType?: TGateType | null },
): boolean {
  return gateTypeOf(gate) === preferredGateTypeOf(visit)
}

// ── timeline ──

const STEP = 30
export const TIMELINE_MIN_END = 17 * 60
const DEFAULT_START = 8 * 60
const MIN_BAR_PCT = 1
const SHORT_NAME_LENGTH = 12

/** Minutes since midnight of an API timestamp. The API sends local time, so the clock part is read as written. */
export function clockMinutes(iso: string | null | undefined): number | null {
  const m = /T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(iso ?? '')
  return m ? Number(m[1]) * 60 + Number(m[2]) + Number(m[3] ?? 0) / 60 : null
}

export function hhmm(minute: number): string {
  const h = Math.floor(minute / 60)
  return `${String(h).padStart(2, '0')}:${String(Math.floor(minute % 60)).padStart(2, '0')}`
}

type BarDraft = Omit<TTimelineBar, 'lane'>

/** Greedy lanes: a bar goes in the first lane whose last bar has ended. */
function assignLanes(bars: BarDraft[]): { bars: TTimelineBar[], laneCount: number } {
  const laneEnds: number[] = []
  const out = bars.map(b => {
    let lane = laneEnds.findIndex(end => end <= b.leftPct)
    if (lane < 0) lane = laneEnds.length
    laneEnds[lane] = b.leftPct + b.widthPct
    return { ...b, lane }
  })
  return { bars: out, laneCount: Math.max(1, laneEnds.length) }
}

/**
 * The day as a Bookings-style grid: gates as rows, time across a 30-minute ruler. The ruler is
 * for familiarity only; a booking stays one wide window. Bars come from `gates[].unloading`
 * (in progress, up to now) and `done` (called to finished); positions are percentages of the axis.
 */
export function buildTimeline(board: TReceivingBoard, windows: TReceivingWindow[]): TTimelineModel {
  const active = windows.filter(w => w.isActive)
  const used = active.length > 0 ? active : windows
  const first = used.length > 0 ? Math.min(...used.map(w => w.startMinute)) : DEFAULT_START
  const last = used.length > 0 ? Math.max(...used.map(w => w.endMinute)) : TIMELINE_MIN_END
  const start = Math.floor(first / STEP) * STEP
  const end = Math.max(Math.ceil(Math.max(last, TIMELINE_MIN_END) / STEP) * STEP, start + STEP)
  const span = end - start
  const pct = (minute: number) => ((minute - start) / span) * 100

  const ticks: TTimelineTick[] = []
  for (let m = start; m <= end; m += STEP) ticks.push({ minute: m, label: hhmm(m), leftPct: pct(m) })

  const nowMinute = clockMinutes(board.serverNow)
  const isToday = board.serverNow.slice(0, 10) === board.visitDate.slice(0, 10)
  const nowPct = isToday && nowMinute !== null && nowMinute >= start && nowMinute <= end ? pct(nowMinute) : null

  const toBar = (v: TVisit, inProgress: boolean): BarDraft | null => {
    const from = clockMinutes(v.calledAt)
    const rawTo = inProgress ? nowMinute : clockMinutes(v.finishedAt)
    if (from === null || rawTo === null) return null
    const to = Math.max(rawTo, from)
    const a = Math.max(from, start)
    const b = Math.min(to, end)
    if (a >= end || to <= start) return null
    const leftPct = pct(a)
    const times = `${hhmm(from)}–${hhmm(to)}${inProgress ? ' (กำลังลงของ)' : ''}`
    return {
      visitId: v.id,
      queueNo: v.queueNo,
      supplierName: v.supplierName,
      shortName: v.supplierName.length > SHORT_NAME_LENGTH ? v.supplierName.slice(0, SHORT_NAME_LENGTH) + '…' : v.supplierName,
      leftPct,
      widthPct: Math.min(Math.max(pct(b) - leftPct, MIN_BAR_PCT), 100 - leftPct),
      inProgress,
      detail: `คิว ${v.queueNo ?? '-'} ${v.supplierName} · ${v.billCount} บิล · ${times}`,
    }
  }

  const gates: TTimelineGateRow[] = board.gates.map(g => {
    const bars = [
      ...board.done.filter(v => v.gateId === g.id).map(v => toBar(v, false)),
      ...g.unloading.map(v => toBar(v, true)),
    ]
      .filter((b): b is BarDraft => b !== null)
      .sort((x, y) => x.leftPct - y.leftPct)
    return { gateId: g.id, gateName: g.gateName, gateType: gateTypeOf(g), isActive: g.isActive, ...assignLanes(bars) }
  })

  const seen = new Set<number>()
  const booked = [...board.expected, ...board.queue, ...board.gates.flatMap(g => g.unloading), ...board.done]
    .filter(v => v.source === 'BOOKED' && v.windowId !== null && !seen.has(v.id) && seen.add(v.id))
  const bookings: TTimelineBooking[] = used.map(w => {
    const a = Math.max(w.startMinute, start)
    const b = Math.min(w.endMinute, end)
    return {
      windowId: w.id,
      label: w.label,
      leftPct: pct(a),
      widthPct: Math.max(pct(b) - pct(a), 0),
      bookedCount: booked.filter(v => v.windowId === w.id).length,
      remainingCount: board.expected.filter(v => v.windowId === w.id).length,
    }
  })

  return { startMinute: start, endMinute: end, tickPct: (STEP / span) * 100, ticks, bookings, gates, nowPct }
}
