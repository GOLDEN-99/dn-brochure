import { ItemPriceImportExcelService } from './item-price-import-excel.service';

describe('ItemPriceImportExcelService', () => {
  let service: ItemPriceImportExcelService

  beforeEach(() => {
    service = new ItemPriceImportExcelService()
  })

  it('maps column aliases (Thai / camelCase) onto barcode, price and name', () => {
    const rows = service.validateRows([
      { 'บาร์โค้ด': '408569', 'ราคาโปร': 2199, 'ชื่อโปร': 'โปร A' },
      { barCode: 12345, promoPrice: '1,250.50' },
      { 'รหัสสินค้า': ' 777 ', 'ราคา': 0 },
    ])
    expect(rows.every(r => r.valid)).toBeTrue()
    expect(rows[0]).toEqual(jasmine.objectContaining({ barcode: '408569', price: 2199, name: 'โปร A' }))
    expect(rows[1]).toEqual(jasmine.objectContaining({ barcode: '12345', price: 1250.5, name: null }))
    expect(rows[2]).toEqual(jasmine.objectContaining({ barcode: '777', price: 0 }))
  })

  it('numbers rows from 2 (header is Excel row 1)', () => {
    const rows = service.validateRows([
      { barcode: 'A', price: 1 },
      { barcode: 'B', price: 2 },
    ])
    expect(rows.map(r => r.rowNumber)).toEqual([2, 3])
  })

  it('flags an empty or missing barcode as EMPTY_BARCODE', () => {
    const rows = service.validateRows([
      { barcode: '   ', price: 10 },
      { price: 10 },
      { barcode: '', price: 'abc' },   // barcode error wins over price error
    ])
    expect(rows.map(r => r.valid)).toEqual([false, false, false])
    expect(rows.map(r => r.reasonCode)).toEqual(['EMPTY_BARCODE', 'EMPTY_BARCODE', 'EMPTY_BARCODE'])
    expect(rows[0].reason).toBeTruthy()
  })

  it('flags INVALID_PRICE for non-numeric, negative, missing and > 2 dp prices', () => {
    const rows = service.validateRows([
      { barcode: 'A', price: 'abc' },
      { barcode: 'B', price: -1 },
      { barcode: 'C' },
      { barcode: 'D', price: 10.125 },
      { barcode: 'E', price: 10.12 },
      { barcode: 'F', price: '' },
    ])
    expect(rows.map(r => r.reasonCode)).toEqual([
      'INVALID_PRICE', 'INVALID_PRICE', 'INVALID_PRICE', 'INVALID_PRICE', null, 'INVALID_PRICE',
    ])
    expect(rows[4].valid).toBeTrue()
    expect(rows[4].price).toBe(10.12)
    expect(rows[3].rawPrice).toBe('10.125')
  })

  it('marks the later duplicate barcode as DUPLICATE_IN_FILE and keeps the first', () => {
    const rows = service.validateRows([
      { barcode: '111', price: 1 },
      { barcode: '222', price: 2 },
      { barcode: ' 111', price: 3 },
      { barcode: '111', price: 4 },
    ])
    expect(rows[0].valid).toBeTrue()
    expect(rows[1].valid).toBeTrue()
    expect(rows[2].reasonCode).toBe('DUPLICATE_IN_FILE')
    expect(rows[3].reasonCode).toBe('DUPLICATE_IN_FILE')
    expect(rows[2].rowNumber).toBe(4)
  })

  it('does not count an invalid row as a duplicate source', () => {
    const rows = service.validateRows([
      { barcode: '111', price: 'x' },
      { barcode: '111', price: 5 },
    ])
    expect(rows[0].reasonCode).toBe('INVALID_PRICE')
    expect(rows[1].valid).toBeTrue()
  })
})
