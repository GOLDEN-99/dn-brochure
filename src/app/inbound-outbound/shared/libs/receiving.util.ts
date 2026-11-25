import { HttpErrorResponse } from '@angular/common/http';
import {
  TGateBoard,
  TPunctuality,
  TReceivingSettings,
  TSizeClass,
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
