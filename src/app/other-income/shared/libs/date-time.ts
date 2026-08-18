import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export const ngbDateToIso = ({ day, month, year }: NgbDateStruct) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

export const isoToNgbDate = (iso: string): NgbDateStruct => {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

const toIsoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/**
 * Normalises an API date to a plain ISO date (`2026-01-20`) for Excel export
 * `valueMapper`s, dropping any time part. Accepts both plain (`2026-01-20`)
 * and datetime (`2026-01-20T00:00:00`) API values; the date is read off the
 * string rather than via `new Date()` so it is never shifted a day by the
 * local timezone. Returns `fallback` for null/empty/unparseable input.
 */
export const toIsoDateOnly = (value: string | null | undefined, fallback = ''): string => {
  const match = /^\d{4}-\d{2}-\d{2}/.exec(value ?? '')
  return match ? match[0] : fallback
}

export const startOfYearRange = () => {
  const now = new Date();
  return {
    startDate: toIsoDate(new Date(now.getFullYear(), 0, 1)),
    endDate: toIsoDate(new Date(now.getFullYear(), 11, 31)),
  };
}

export const startOfMonthRange = () => {
  const now = new Date();
  return {
    startDate: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: toIsoDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}