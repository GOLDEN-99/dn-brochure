import { HttpErrorResponse } from '@angular/common/http';
import { TGateBoard, TReceivingSettings, TVisit } from '../types/receiving.type';
import {
  apiErrorMessage,
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
