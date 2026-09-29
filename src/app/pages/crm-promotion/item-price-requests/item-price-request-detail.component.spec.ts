import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CrmPromotionService } from '../../../service/crm-promotion/crm-promotion.service';
import { ItemPriceRequestDetailComponent, POLL_INTERVAL_MS } from './item-price-request-detail.component';
import { TItemPriceRequestDetail, TItemPriceRequestStatus } from '../create/item-price-import/item-price-import.types';

const detail = (status: TItemPriceRequestStatus, over: Partial<TItemPriceRequestDetail> = {}): TItemPriceRequestDetail => ({
  id: 17,
  name: 'โปรตุลา 2026',
  startDate: '2026-10-01T00:00:00',
  endDate: '2026-10-31T00:00:00',
  source: 'SUPPLIER',
  promotionOrder: 1,
  activeDay: '1111111',
  status,
  createdBy: '1715',
  createdAt: '2026-09-29T10:00:00',
  issueStartedAt: null,
  issueFinishedAt: null,
  issueError: null,
  issuedCount: 0,
  skippedCount: 0,
  totalCount: 2,
  lines: [
    {
      id: 901, rowNumber: 2, barcode: '408569', price: 2199, name: null,
      goodCode: '000123', goodName: 'Good', resolveStatus: 'OK', reasonCode: null, reason: null,
      promotionId: null,
      ladder: { price1: 2500, price2: 2400, price3: 2350, price4: 2300, price5: 2250, price6: 2100, priceA: 0, priceB: 0, priceC: 0 },
    },
  ],
  ...over,
})

describe('ItemPriceRequestDetailComponent', () => {
  let fixture: ComponentFixture<ItemPriceRequestDetailComponent>
  let component: ItemPriceRequestDetailComponent
  let service: jasmine.SpyObj<CrmPromotionService>

  beforeEach(async () => {
    service = jasmine.createSpyObj<CrmPromotionService>('CrmPromotionService', [
      'getItemPriceRequest',
      'retryItemPriceRequest',
    ])
    await TestBed.configureTestingModule({
      imports: [ItemPriceRequestDetailComponent],
      providers: [provideRouter([]), { provide: CrmPromotionService, useValue: service }],
    }).compileComponents()

    fixture = TestBed.createComponent(ItemPriceRequestDetailComponent)
    component = fixture.componentInstance
  })

  it('polls every 3 s while QUEUED / ISSUING and stops on a terminal status', fakeAsync(() => {
    service.getItemPriceRequest.and.returnValues(
      of(detail('QUEUED')),
      of(detail('ISSUING', { issuedCount: 1 })),
      of(detail('ISSUED', { issuedCount: 2, lines: [{ ...detail('ISSUED').lines[0], promotionId: 131 }] })),
    )
    fixture.componentRef.setInput('id', '17')
    fixture.detectChanges()

    expect(service.getItemPriceRequest).toHaveBeenCalledTimes(1)
    expect(service.getItemPriceRequest).toHaveBeenCalledWith(17)
    expect(component.detail()?.status).toBe('QUEUED')
    expect(component.polling()).toBeTrue()

    tick(POLL_INTERVAL_MS)
    expect(service.getItemPriceRequest).toHaveBeenCalledTimes(2)
    expect(component.detail()?.status).toBe('ISSUING')
    expect(component.progressPercent()).toBe(50)

    tick(POLL_INTERVAL_MS)
    expect(service.getItemPriceRequest).toHaveBeenCalledTimes(3)
    expect(component.detail()?.status).toBe('ISSUED')
    expect(component.isTerminal()).toBeTrue()
    expect(component.polling()).toBeFalse()

    // No further polls once terminal.
    tick(POLL_INTERVAL_MS * 3)
    expect(service.getItemPriceRequest).toHaveBeenCalledTimes(3)
    discardPeriodicTasks()
  }))

  it('does not poll when the first response is already terminal', fakeAsync(() => {
    service.getItemPriceRequest.and.returnValue(of(detail('ISSUED_WITH_SKIPS', { issuedCount: 1, skippedCount: 1 })))
    fixture.componentRef.setInput('id', 17)
    fixture.detectChanges()

    tick(POLL_INTERVAL_MS * 2)
    expect(service.getItemPriceRequest).toHaveBeenCalledTimes(1)
    expect(component.polling()).toBeFalse()
    expect(component.progressPercent()).toBe(100)
  }))

  it('retry on FAILED calls the API then resumes polling', fakeAsync(() => {
    service.getItemPriceRequest.and.returnValues(
      of(detail('FAILED', { issueError: 'boom' })),
      of(detail('QUEUED')),
      of(detail('ISSUED', { issuedCount: 2 })),
    )
    service.retryItemPriceRequest.and.returnValue(of({ id: 17 }))
    fixture.componentRef.setInput('id', 17)
    fixture.detectChanges()
    expect(component.detail()?.status).toBe('FAILED')
    expect(component.polling()).toBeFalse()

    component.retry()
    expect(service.retryItemPriceRequest).toHaveBeenCalledWith(17)
    expect(service.getItemPriceRequest).toHaveBeenCalledTimes(2)
    expect(component.detail()?.status).toBe('QUEUED')
    expect(component.polling()).toBeTrue()

    tick(POLL_INTERVAL_MS)
    expect(service.getItemPriceRequest).toHaveBeenCalledTimes(3)
    expect(component.polling()).toBeFalse()
    discardPeriodicTasks()
  }))

  it('stops the timer on destroy', fakeAsync(() => {
    service.getItemPriceRequest.and.returnValue(of(detail('ISSUING')))
    fixture.componentRef.setInput('id', 17)
    fixture.detectChanges()
    expect(service.getItemPriceRequest).toHaveBeenCalledTimes(1)

    fixture.destroy()
    tick(POLL_INTERVAL_MS * 2)
    expect(service.getItemPriceRequest).toHaveBeenCalledTimes(1)
  }))
})
