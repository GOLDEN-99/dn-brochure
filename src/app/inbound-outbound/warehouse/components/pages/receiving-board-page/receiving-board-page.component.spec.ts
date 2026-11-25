import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { OtherIncomeEmplAuthService } from '../../../../../other-income/shared/services/other-income-empl-auth.service';
import { ToastService } from '../../../../../service/toast/toast.service';
import { ReceivingApiService } from '../../../services/receiving-api.service';
import { TGateBoard, TReceivingBoard, TReceivingConfig, TVisit } from '../../../../shared/types/receiving.type';
import { ReceivingBoardPageComponent } from './receiving-board-page.component';

const visit = (id: number, over: Partial<TVisit> = {}): TVisit => ({
  id, warehouseCode: 'BMS', visitDate: '2026-11-25', queueNo: id, source: 'WALK_IN', status: 'WAITING',
  supplierName: 'ผู้ส่ง ' + id, compCode: null, compType: null, carriesDn: true, carriesHu: false,
  billCount: 3, sizeClass: 'M', units: 1, windowId: null, windowLabel: null, punctuality: null,
  hasPriority: false, queuePosition: null, truckPlate: null, driverPhone: null, note: null,
  gateId: null, gateName: null, arrivedAt: '2026-11-25T10:00:00', calledAt: null, finishedAt: null,
  waitMinutes: 12, unloadMinutes: null, cancelReason: null, orders: [],
  ...over,
})

const gate = (id: number, unloading: TVisit[] = []): TGateBoard =>
  ({ id, gateName: String(id), isActive: true, unloading })

const CONFIG: TReceivingConfig = {
  settings: {
    warehouseCode: 'BMS', warehouseName: 'คลังบุญมีทรัพย์', sizeMMinBills: 2, sizeLMinBills: 6, sizeLUnits: 2,
    onTimeToleranceMinutes: 30, busyTruckThreshold: 5,
  },
  gates: [],
  windows: [],
}

const board = (over: Partial<TReceivingBoard> = {}): TReceivingBoard => ({
  warehouseCode: 'BMS', visitDate: '2026-11-25', serverNow: '2026-11-25T10:12:00',
  summary: { booked: 1, waiting: 2, unloading: 1, done: 0, cancelled: 0, isBusy: false },
  queue: [
    visit(2, { source: 'BOOKED', punctuality: 'ON_TIME', hasPriority: true, queuePosition: 1, windowLabel: '10:00–12:00' }),
    visit(1, { queuePosition: 2 }),
  ],
  gates: [gate(7), gate(8, [visit(3, { status: 'UNLOADING', gateId: 8, gateName: '8', unloadMinutes: 20 })])],
  expected: [visit(4, { source: 'BOOKED', status: 'BOOKED', queueNo: null, billCount: 5, windowLabel: '13:00–15:00' })],
  done: [],
  cancelled: [],
  ...over,
})

describe('ReceivingBoardPageComponent', () => {
  let fixture: ComponentFixture<ReceivingBoardPageComponent>
  let component: ReceivingBoardPageComponent
  let api: jasmine.SpyObj<ReceivingApiService>
  let toast: jasmine.SpyObj<ToastService>

  const create = async (data: TReceivingBoard = board()) => {
    api = jasmine.createSpyObj<ReceivingApiService>('ReceivingApiService',
      ['getConfig', 'getBoard', 'checkInWalkIn', 'checkInBooked', 'assignGate', 'finish', 'cancel', 'searchSuppliers'])
    api.getConfig.and.returnValue(of(CONFIG))
    api.getBoard.and.returnValue(of(data))
    api.searchSuppliers.and.returnValue(of([]))
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'danger'])

    await TestBed.configureTestingModule({
      imports: [ReceivingBoardPageComponent],
      providers: [
        { provide: ReceivingApiService, useValue: api },
        { provide: ToastService, useValue: toast },
        { provide: OtherIncomeEmplAuthService, useValue: { employee: signal({ emplCode: '4065', emplName: 'ผู้ทดสอบ' }) } },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(ReceivingBoardPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? ''

  it('loads config and board and renders the queue in the order the API sent', async () => {
    await create()

    expect(api.getConfig).toHaveBeenCalledWith('BMS')
    expect(api.getBoard).toHaveBeenCalledWith('BMS')
    const names = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.receiving-board__next, .list-group-item'))
      .map(el => el.textContent ?? '')
    expect(text()).toContain('คิวรับสินค้า คลังบุญมีทรัพย์')
    expect(text().indexOf('ผู้ส่ง 2')).toBeLessThan(text().indexOf('ผู้ส่ง 1'))
    expect(text()).toContain('จอง · ตรงเวลา')
    expect(names.length).toBeGreaterThan(0)
  })

  it('splits gates into free and occupied', async () => {
    await create()

    expect(component.free().map(g => g.id)).toEqual([7])
    expect(component.occupied().map(g => g.id)).toEqual([8])
  })

  it('shows the busy warning only when the API flags it', async () => {
    await create()
    expect(text()).not.toContain('เวลารอจะเริ่มยาว')

    await TestBed.resetTestingModule()
    await create(board({ summary: { booked: 0, waiting: 4, unloading: 1, done: 0, cancelled: 0, isBusy: true } }))
    expect(text()).toContain('เวลารอจะเริ่มยาว')
  })

  it('shows an error and no board when the board fails to load', async () => {
    api = jasmine.createSpyObj<ReceivingApiService>('ReceivingApiService', ['getConfig', 'getBoard', 'searchSuppliers'])
    api.getConfig.and.returnValue(of(CONFIG))
    api.getBoard.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })))
    await TestBed.configureTestingModule({
      imports: [ReceivingBoardPageComponent],
      providers: [
        { provide: ReceivingApiService, useValue: api },
        { provide: ToastService, useValue: jasmine.createSpyObj<ToastService>('ToastService', ['success', 'danger']) },
        { provide: OtherIncomeEmplAuthService, useValue: { employee: signal(null) } },
      ],
    }).compileComponents()
    fixture = TestBed.createComponent(ReceivingBoardPageComponent)
    fixture.detectChanges()

    expect(text()).toContain('โหลดคิวรับสินค้าไม่สำเร็จ')
    expect(fixture.componentInstance.board()).toBeNull()
  })

  it('checks a walk-in in with the warehouse and the employee, then reloads', async () => {
    await create()
    api.checkInWalkIn.and.returnValue(of(visit(9, { queueNo: 9 })))

    component.checkInWalkIn({
      supplierName: 'DKSH', compCode: null, compType: null, carriesDn: true, carriesHu: false,
      billCount: 4, truckPlate: null, driverPhone: null, note: null, orders: [],
    })

    expect(api.checkInWalkIn).toHaveBeenCalledWith(jasmine.objectContaining({
      warehouseCode: 'BMS', checkedInBy: '4065', supplierName: 'DKSH', billCount: 4,
    }))
    expect(toast.success).toHaveBeenCalled()
    expect(api.getBoard).toHaveBeenCalledTimes(2)
    expect(component.busy()).toBeFalse()
  })

  it('checks a booked truck in with the typed bill count, defaulting to the booked estimate', async () => {
    await create()
    api.checkInBooked.and.returnValue(of(visit(4, { queueNo: 5 })))
    const booked = component.board()!.expected[0]

    expect(component.arrivalBillsOf(booked)).toBe('5')
    component.setArrivalBills(booked, '8')
    component.checkInBooked(booked)

    expect(api.checkInBooked).toHaveBeenCalledWith(4, { billCount: 8, truckPlate: null, checkedInBy: '4065' })
  })

  it('refuses a booked check-in with a bad bill count without calling the API', async () => {
    await create()
    const booked = component.board()!.expected[0]

    component.setArrivalBills(booked, '0')
    component.checkInBooked(booked)

    expect(api.checkInBooked).not.toHaveBeenCalled()
    expect(toast.danger).toHaveBeenCalled()
  })

  it('sends a truck to a free gate in one click', async () => {
    await create()
    api.assignGate.and.returnValue(of(visit(2, { gateName: '7' })))
    const next = component.board()!.queue[0]

    component.assignGate(next, component.free()[0])

    expect(api.assignGate).toHaveBeenCalledWith(2, 7, false)
  })

  it('needs a second click to double up an occupied gate, and then forces it', async () => {
    await create()
    api.assignGate.and.returnValue(of(visit(2, { gateName: '8' })))
    const next = component.board()!.queue[0]
    const occupied = component.occupied()[0]

    component.assignGate(next, occupied)
    expect(api.assignGate).not.toHaveBeenCalled()
    expect(component.isDoubleArmed(next, occupied)).toBeTrue()

    component.assignGate(next, occupied)
    expect(api.assignGate).toHaveBeenCalledWith(2, 8, true)
    expect(component.armed()).toBeNull()
  })

  it('releases a truck', async () => {
    await create()
    api.finish.and.returnValue(of(visit(3, { status: 'DONE' })))

    component.finish(component.board()!.gates[1].unloading[0])

    expect(api.finish).toHaveBeenCalledWith(3)
  })

  it('cancels on the second click only', async () => {
    await create()
    api.cancel.and.returnValue(of(visit(1, { status: 'CANCELLED' })))
    const waiting = component.board()!.queue[1]

    component.cancel(waiting)
    expect(api.cancel).not.toHaveBeenCalled()
    expect(component.isCancelArmed(waiting)).toBeTrue()

    component.cancel(waiting)
    expect(api.cancel).toHaveBeenCalledWith(1, null)
  })

  it('shows the API refusal and still reloads the board', async () => {
    await create()
    api.assignGate.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 409, error: { error: 'visit was changed by someone else; reload the board' },
    })))

    component.assignGate(component.board()!.queue[0], component.free()[0])

    expect(toast.danger).toHaveBeenCalledWith('visit was changed by someone else; reload the board')
    expect(api.getBoard).toHaveBeenCalledTimes(2)
    expect(component.busy()).toBeFalse()
  })
})
