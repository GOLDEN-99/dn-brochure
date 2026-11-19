import { formatThaiDateRangeShort, inclusiveDayCount } from './thai-date';

/** The API hands back UTC instants and the brochure code shifts them by +7h to
 *  land on the Bangkok calendar date, so the fixtures below are written as the
 *  instants the API actually returns, not as local dates. */
const bkk = (y: number, m: number, d: number) =>
  new Date(Date.UTC(y, m - 1, d) - 7 * 60 * 60 * 1000).toISOString()

describe('formatThaiDateRangeShort', () => {
  it('states the month and year once when both ends share them', () => {
    expect(formatThaiDateRangeShort(bkk(2026, 9, 15), bkk(2026, 9, 21)))
      .toBe('15 – 21 ก.ย. 2569')
  })

  it('repeats the month, not the year, across a month boundary', () => {
    expect(formatThaiDateRangeShort(bkk(2026, 9, 28), bkk(2026, 10, 4)))
      .toBe('28 ก.ย. – 4 ต.ค. 2569')
  })

  it('repeats both month and year across a year boundary', () => {
    expect(formatThaiDateRangeShort(bkk(2026, 12, 28), bkk(2027, 1, 3)))
      .toBe('28 ธ.ค. 2569 – 3 ม.ค. 2570')
  })

  it('collapses to a single date when the promotion lasts one day', () => {
    expect(formatThaiDateRangeShort(bkk(2026, 9, 15), bkk(2026, 9, 15)))
      .toBe('15 ก.ย. 2569')
  })

  it('converts to the Buddhist year', () => {
    expect(formatThaiDateRangeShort(bkk(2027, 3, 1), bkk(2027, 3, 2)))
      .toContain('2570')
  })

  it('uses an en dash, as the approved design draws it', () => {
    const out = formatThaiDateRangeShort(bkk(2026, 9, 15), bkk(2026, 9, 21))
    expect(out).toContain('–')
    expect(out).not.toContain('-')
  })

  describe('the +7h Bangkok shift', () => {
    it('keeps an instant at Bangkok midnight on the new day', () => {
      // 2026-09-14T17:00:00Z is 2026-09-15 00:00 in Bangkok
      expect(formatThaiDateRangeShort('2026-09-14T17:00:00.000Z', '2026-09-14T17:00:00.000Z'))
        .toBe('15 ก.ย. 2569')
    })

    it('keeps the instant one minute earlier on the previous day', () => {
      expect(formatThaiDateRangeShort('2026-09-14T16:59:00.000Z', '2026-09-14T16:59:00.000Z'))
        .toBe('14 ก.ย. 2569')
    })
  })

  describe('missing or unusable input', () => {
    for (const [label, from, to] of [
      ['both missing', null, null],
      ['from missing', null, '2026-09-21T17:00:00.000Z'],
      ['to missing', '2026-09-15T17:00:00.000Z', null],
      ['empty strings', '', ''],
      ['unparseable', 'not-a-date', 'not-a-date'],
    ] as [string, string | null, string | null][]) {
      it(`returns an empty string: ${label}`, () => {
        expect(formatThaiDateRangeShort(from, to)).toBe('')
      })
    }
  })
})

describe('the format PaperProFlash actually returns', () => {
  // promotion 408: fromDate 11/01/2025, toDate 11/07/2025, day 7,
  // dayActive "01-07 พ.ย. 2568" — which only agrees under MM/DD/YYYY
  const FROM = '11/01/2025 00:00:00'
  const TO = '11/07/2025 00:00:00'

  it('reads MM/DD/YYYY rather than DD/MM/YYYY', () => {
    expect(formatThaiDateRangeShort(FROM, TO)).toBe('1 – 7 พ.ย. 2568')
  })

  it('counts the days to match the API\'s own `day` field', () => {
    expect(inclusiveDayCount(FROM, TO)).toBe(7)
  })

  it('does not shift a slashed date across midnight', () => {
    // it names a calendar date, so it takes no +7h correction
    expect(formatThaiDateRangeShort('12/31/2026 00:00:00', '12/31/2026 00:00:00'))
      .toBe('31 ธ.ค. 2569')
  })

  it('handles a single-digit month and day', () => {
    expect(formatThaiDateRangeShort('1/5/2026 00:00:00', '1/9/2026 00:00:00'))
      .toBe('5 – 9 ม.ค. 2569')
  })

  it('still reads ISO, which the A4 brochures use', () => {
    expect(formatThaiDateRangeShort(bkk(2026, 9, 15), bkk(2026, 9, 21)))
      .toBe('15 – 21 ก.ย. 2569')
  })

  it('rejects an out-of-range month', () => {
    expect(formatThaiDateRangeShort('13/01/2026 00:00:00', '13/05/2026 00:00:00')).toBe('')
  })
})

describe('inclusiveDayCount', () => {
  it('counts both end days', () => {
    expect(inclusiveDayCount(bkk(2026, 9, 15), bkk(2026, 9, 21))).toBe(7)
  })

  it('counts a single-day promotion as one', () => {
    expect(inclusiveDayCount(bkk(2026, 9, 15), bkk(2026, 9, 15))).toBe(1)
  })

  it('counts across a month boundary', () => {
    expect(inclusiveDayCount(bkk(2026, 9, 28), bkk(2026, 10, 4))).toBe(7)
  })

  it('counts across a year boundary', () => {
    expect(inclusiveDayCount(bkk(2026, 12, 28), bkk(2027, 1, 3))).toBe(7)
  })

  it('counts past the retired nine-day ceiling', () => {
    // the old code clamped this to 9 and printed "9 วันเท่านั้น"
    expect(inclusiveDayCount(bkk(2026, 9, 15), bkk(2026, 9, 28))).toBe(14)
  })

  it('counts a month-long promotion', () => {
    expect(inclusiveDayCount(bkk(2026, 11, 1), bkk(2026, 11, 30))).toBe(30)
  })

  it('is unaffected by daylight-saving-free UTC arithmetic over a leap day', () => {
    expect(inclusiveDayCount(bkk(2028, 2, 28), bkk(2028, 3, 1))).toBe(3)
  })

  it('returns null when the end precedes the start', () => {
    expect(inclusiveDayCount(bkk(2026, 9, 21), bkk(2026, 9, 15))).toBeNull()
  })

  it('returns null when a date is missing', () => {
    expect(inclusiveDayCount(null, null)).toBeNull()
    expect(inclusiveDayCount(bkk(2026, 9, 15), null)).toBeNull()
  })

  it('returns null when a date is unparseable', () => {
    expect(inclusiveDayCount('not-a-date', 'also-not')).toBeNull()
  })
})
