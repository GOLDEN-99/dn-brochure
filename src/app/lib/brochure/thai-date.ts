/** Thai date helpers for the Flash Sale date chip.
 *
 *  The A4 brochures spell months out in full and repeat the month and year on
 *  both sides ("15 กันยายน 2569 - 21 กันยายน 2569"). The approved Flash Sale
 *  design uses the short form and states the month once ("15 – 21 ก.ย. 2569"),
 *  so it needs its own formatter rather than reusing brochure-page's.
 *
 *  PROVISIONAL: the cross-month and cross-year wordings below are our proposal,
 *  still awaiting confirmation from the business side — see
 *  docs/brochure-restyle/FLASH-SALE-ASSET-LIST.md §6.3 question 1.
 */

const MONTH_ABBR = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
] as const

/** en dash, as drawn in the approved design */
const DASH = '–'

const MS_PER_DAY = 24 * 60 * 60 * 1000

type Ymd = { y: number; m: number; d: number }

/** PaperProFlash returns "11/01/2025 00:00:00" — MM/DD/YYYY, not ISO.
 *  Confirmed against promotion 408, whose fromDate 11/01 / toDate 11/07 and
 *  dayActive "01-07 พ.ย. 2568" agree only under MM/DD.
 *  That form already names a calendar date, so it takes no timezone shift;
 *  an ISO instant still does, matching the rest of the brochure code. */
function toBangkokYmd(value: string): Ymd | null {
  const slashed = value.match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slashed) {
    const [, mm, dd, yyyy] = slashed
    const y = +yyyy, m = +mm, d = +dd
    if (m < 1 || m > 12 || d < 1 || d > 31) return null
    return { y, m, d }
  }

  const unix = new Date(value).getTime()
  if (Number.isNaN(unix)) return null
  const shifted = new Date(unix + 7 * 60 * 60 * 1000)
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth() + 1,
    d: shifted.getUTCDate(),
  }
}

const buddhistYear = (year: number) => year + 543

/**
 * "15 – 21 ก.ย. 2569"              same month
 * "28 ก.ย. – 4 ต.ค. 2569"          crosses a month
 * "28 ธ.ค. 2569 – 3 ม.ค. 2570"     crosses a year
 * "15 ก.ย. 2569"                   both ends on the same day
 */
export function formatThaiDateRangeShort(fromIso?: string | null, toIso?: string | null): string {
  if (!fromIso || !toIso) return ''
  const a = toBangkokYmd(fromIso)
  const b = toBangkokYmd(toIso)
  if (!a || !b) return ''

  const fromMonth = MONTH_ABBR[a.m - 1]
  const toMonth = MONTH_ABBR[b.m - 1]

  if (a.y === b.y && a.m === b.m) {
    if (a.d === b.d) return `${a.d} ${fromMonth} ${buddhistYear(a.y)}`
    return `${a.d} ${DASH} ${b.d} ${fromMonth} ${buddhistYear(a.y)}`
  }
  if (a.y === b.y) {
    return `${a.d} ${fromMonth} ${DASH} ${b.d} ${toMonth} ${buddhistYear(a.y)}`
  }
  return `${a.d} ${fromMonth} ${buddhistYear(a.y)} ${DASH} ${b.d} ${toMonth} ${buddhistYear(b.y)}`
}

/** inclusive day count, used only when the API does not supply `day` */
export function inclusiveDayCount(fromIso?: string | null, toIso?: string | null): number | null {
  if (!fromIso || !toIso) return null
  const a = toBangkokYmd(fromIso)
  const b = toBangkokYmd(toIso)
  if (!a || !b) return null
  const start = Date.UTC(a.y, a.m - 1, a.d)
  const end = Date.UTC(b.y, b.m - 1, b.d)
  const days = Math.round((end - start) / MS_PER_DAY) + 1
  return days > 0 ? days : null
}
