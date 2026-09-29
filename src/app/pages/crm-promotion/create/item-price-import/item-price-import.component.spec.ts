import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CrmPromotionService } from '../../../../service/crm-promotion/crm-promotion.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { ItemPriceImportComponent } from './item-price-import.component';
import { TParsedRow } from './item-price-import-excel.service';
import { TResolveResponse, TResolvedLine } from './item-price-import.types';

const parsed = (rowNumber: number, over: Partial<TParsedRow> = {}): TParsedRow => ({
  rowNumber,
  barcode: `B${rowNumber}`,
  price: 100,
  name: null,
  rawPrice: '100',
  valid: true,
  reasonCode: null,
  reason: null,
  ...over,
})

const resolved = (rowNumber: number, over: Partial<TResolvedLine> = {}): TResolvedLine => ({
  rowNumber,
  barcode: `B${rowNumber}`,
  price: 100,
  name: null,
  status: 'OK',
  reasonCode: null,
  reason: null,
  matchedBy: 'GOODINFO',
  goodCode: `G${rowNumber}`,
  goodName: `Good ${rowNumber}`,
  competitiveGroup: '-',
  ladder: { price1: 150, price2: 140, price3: 130, price4: 120, price5: 110, price6: 90, priceA: 0, priceB: 0, priceC: 0 },
  levels: [{ level: '1', memberPrice: 150, walkInPrice: null, branchCount: 10, qualifies: true }],
  branchesAbove: 10,
  branchesBelow: 2,
  overlapping: [],
  ...over,
})

describe('ItemPriceImportComponent', () => {
  let fixture: ComponentFixture<ItemPriceImportComponent>
  let component: ItemPriceImportComponent
  let service: jasmine.SpyObj<CrmPromotionService>
  let router: Router
  let toast: jasmine.SpyObj<ToastService>

  beforeEach(async () => {
    service = jasmine.createSpyObj<CrmPromotionService>('CrmPromotionService', [
      'resolveItemPrice',
      'createItemPriceRequest',
    ])
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'danger'])

    // The template carries a RouterLink, which needs ActivatedRoute and the router's event
    // stream, so a bare Router spy object cannot host it; use a real router and spy navigate.
    await TestBed.configureTestingModule({
      imports: [ItemPriceImportComponent],
      providers: [
        provideRouter([]),
        { provide: CrmPromotionService, useValue: service },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents()
    router = TestBed.inject(Router)
    spyOn(router, 'navigate').and.resolveTo(true)

    fixture = TestBed.createComponent(ItemPriceImportComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  const fillHeader = () => {
    component.name.set('โปรทดสอบ')
    component.startDate.set('2026-10-01')
    component.endDate.set('2026-10-31')
  }

  it('starts in the header state with a valid-by-default date range and SUPPLIER / order 1', () => {
    expect(component.state()).toBe('header')
    expect(component.source()).toBe('SUPPLIER')
    expect(component.effectivePromotionOrder()).toBe(1)
    expect(component.activeDayString()).toBe('1111111')
    expect(component.headerErrors().name).toBeTruthy()
    expect(component.headerValid()).toBeFalse()
  })

  it('rejects end < start', () => {
    fillHeader()
    component.endDate.set('2026-09-30')
    expect(component.headerErrors().dateRange).toBeTruthy()
    expect(component.headerValid()).toBeFalse()
  })

  it('HU forces promotionOrder to 0 in the request; switching back restores the chosen order', () => {
    fillHeader()
    component.promotionOrder.set(2)
    component.onSourceChange('HU')
    expect(component.isHu()).toBeTrue()
    expect(component.effectivePromotionOrder()).toBe(0)
    expect(component.buildRequest().promotionOrder).toBe(0)

    // The resolve call sends the same pinned order so overlap outcomes match what will be issued.
    service.resolveItemPrice.and.returnValue(of({ rows: [resolved(2)], summary: { total: 1, ok: 1, skip: 0, error: 0 } }))
    component.applyParsedRows([parsed(2)])
    component.resolve()
    expect(service.resolveItemPrice.calls.mostRecent().args[0].promotionOrder).toBe(0)
    component.onSourceChange('SUPPLIER')
    expect(component.effectivePromotionOrder()).toBe(2)
  })

  it('serialises activeDay as a 7-char binary string in Sun..Sat order', () => {
    component.toggleDay(false, 0)
    component.toggleDay(false, 6)
    expect(component.activeDayString()).toBe('0111110')
    component.toggleEveryDay(true)
    expect(component.activeDayString()).toBe('1111111')
  })

  it('resolve sends only client-valid lines and populates the table from the response', () => {
    fillHeader()
    const response: TResolveResponse = {
      rows: [resolved(2), resolved(4, { status: 'SKIP', reasonCode: 'NO_BRANCH_ABOVE_PRICE', reason: 'ไม่มีสาขา' })],
      summary: { total: 2, ok: 1, skip: 1, error: 0 },
    }
    service.resolveItemPrice.and.returnValue(of(response))

    component.applyParsedRows([
      parsed(2),
      parsed(3, { valid: false, reasonCode: 'INVALID_PRICE', reason: 'bad' }),
      parsed(4),
    ])
    expect(component.state()).toBe('parsed')
    component.resolve()

    expect(service.resolveItemPrice).toHaveBeenCalledTimes(1)
    const req = service.resolveItemPrice.calls.mostRecent().args[0]
    expect(req.startDate).toBe('2026-10-01')
    expect(req.endDate).toBe('2026-10-31')
    expect(req.promotionOrder).toBe(1)
    expect(req.lines.map(l => l.rowNumber)).toEqual([2, 4])

    expect(component.state()).toBe('resolved')
    const rows = component.tableRows()
    expect(rows.map(r => r.status)).toEqual(['OK', 'ERROR', 'SKIP'])
    expect(rows[0].goodName).toBe('Good 2')
    expect(rows[0].highlight.has('price1')).toBeTrue()
    expect(rows[0].highlight.has('price6')).toBeFalse()
    expect(component.summary()).toEqual({ total: 3, ok: 1, skip: 1, error: 1 })
    expect(component.sendableCount()).toBe(1)
  })

  it('does not call resolve while the date range is invalid', () => {
    fillHeader()
    component.endDate.set('2026-01-01')
    component.applyParsedRows([parsed(2)])
    component.resolve()
    expect(service.resolveItemPrice).not.toHaveBeenCalled()
    expect(component.errorMessage()).toBeTruthy()
  })

  it('excluded rows are not sent; SKIP/ERROR rows are never sent', () => {
    fillHeader()
    service.resolveItemPrice.and.returnValue(
      of({
        rows: [resolved(2), resolved(3), resolved(4, { status: 'SKIP' })],
        summary: { total: 3, ok: 2, skip: 1, error: 0 },
      }),
    )
    component.applyParsedRows([parsed(2), parsed(3), parsed(4)])
    component.resolve()
    expect(component.sendableCount()).toBe(2)

    component.setExcluded(3, true)
    expect(component.sendableCount()).toBe(1)
    expect(component.buildRequest().lines.map(l => l.rowNumber)).toEqual([2])

    component.setExcluded(3, false)
    expect(component.sendableCount()).toBe(2)
  })

  it('create → navigates to the request detail page', () => {
    fillHeader()
    service.resolveItemPrice.and.returnValue(of({ rows: [resolved(2)], summary: { total: 1, ok: 1, skip: 0, error: 0 } }))
    service.createItemPriceRequest.and.returnValue(of({ id: 17 }))
    spyOn(window, 'confirm').and.returnValue(true)

    component.applyParsedRows([parsed(2)])
    component.resolve()
    expect(component.canIssue()).toBeTrue()
    component.issue()

    expect(service.createItemPriceRequest).toHaveBeenCalledTimes(1)
    const body = service.createItemPriceRequest.calls.mostRecent().args[0]
    expect(body).toEqual(jasmine.objectContaining({
      name: 'โปรทดสอบ',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      source: 'SUPPLIER',
      promotionOrder: 1,
      activeDay: '1111111',
    }))
    expect(body.lines).toEqual([{ rowNumber: 2, barcode: 'B2', price: 100, name: null }])
    expect('createdBy' in body).toBeFalse()
    expect(router.navigate).toHaveBeenCalledWith(['/crm-promotion', 'item-price-requests', 17])
  })

  it('does not issue when the header is invalid or nothing is sendable', () => {
    service.resolveItemPrice.and.returnValue(of({ rows: [resolved(2)], summary: { total: 1, ok: 1, skip: 0, error: 0 } }))
    spyOn(window, 'confirm').and.returnValue(true)
    component.applyParsedRows([parsed(2)])
    component.startDate.set('2026-10-01')
    component.endDate.set('2026-10-31')
    component.resolve()
    // name missing
    expect(component.canIssue()).toBeFalse()
    component.issue()
    expect(service.createItemPriceRequest).not.toHaveBeenCalled()

    component.name.set('x')
    component.setExcluded(2, true)
    expect(component.canIssue()).toBeFalse()
    component.issue()
    expect(service.createItemPriceRequest).not.toHaveBeenCalled()
  })

  it('shows the API 400 field errors and returns to the resolved state', () => {
    fillHeader()
    service.resolveItemPrice.and.returnValue(of({ rows: [resolved(2)], summary: { total: 1, ok: 1, skip: 0, error: 0 } }))
    service.createItemPriceRequest.and.returnValue(
      throwError(() => new HttpErrorResponse({
        status: 400,
        error: { error: 'bad req', statusCode: 40000, message: 'ข้อมูลไม่ถูกต้อง', errors: { name: ['required'] } },
      })),
    )
    spyOn(window, 'confirm').and.returnValue(true)

    component.applyParsedRows([parsed(2)])
    component.resolve()
    component.issue()

    expect(component.state()).toBe('resolved')
    expect(component.errorMessage()).toBe('ข้อมูลไม่ถูกต้อง')
    expect(component.apiFieldErrors()).toEqual({ name: ['required'] })
    expect(router.navigate).not.toHaveBeenCalled()
  })
})
