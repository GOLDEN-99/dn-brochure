import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReceivingApiService } from '../../../services/receiving-api.service';
import { TReceivingSettings, TWalkInDraft } from '../../../../shared/types/receiving.type';
import { WalkInCheckInFormComponent } from './walk-in-check-in-form.component';

const SETTINGS: TReceivingSettings = {
  warehouseCode: 'BMS', warehouseName: 'คลัง', sizeMMinBills: 2, sizeLMinBills: 6, sizeLUnits: 2,
  onTimeToleranceMinutes: 30, busyTruckThreshold: 5,
}

describe('WalkInCheckInFormComponent', () => {
  let fixture: ComponentFixture<WalkInCheckInFormComponent>
  let component: WalkInCheckInFormComponent
  let api: jasmine.SpyObj<ReceivingApiService>
  let emitted: TWalkInDraft[]

  beforeEach(async () => {
    api = jasmine.createSpyObj<ReceivingApiService>('ReceivingApiService', ['searchSuppliers'])
    api.searchSuppliers.and.returnValue(of([{ compCode: 'S001', compName: 'บริษัท ทดสอบ', compType: 'HU' }]))

    await TestBed.configureTestingModule({
      imports: [WalkInCheckInFormComponent],
      providers: [{ provide: ReceivingApiService, useValue: api }],
    }).compileComponents()

    fixture = TestBed.createComponent(WalkInCheckInFormComponent)
    component = fixture.componentInstance
    fixture.componentRef.setInput('settings', SETTINGS)
    emitted = []
    component.submitted.subscribe(draft => emitted.push(draft))
    fixture.detectChanges()
  })

  /** Real clock: the keyword reaches the stream through an effect, then waits out the 350 ms debounce. */
  const settle = async () => {
    fixture.detectChanges()
    await new Promise(resolve => setTimeout(resolve, 450))
    fixture.detectChanges()
  }

  it('does not emit and shows the errors when the form is empty', () => {
    component.submit()
    fixture.detectChanges()

    expect(emitted).toEqual([])
    expect(component.errors().supplierName).toBeTruthy()
    expect(component.errors().company).toBeTruthy()
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('กรอกชื่อผู้ส่งสินค้า')
  })

  it('emits a trimmed free-text walk-in', () => {
    component.typeSupplier('  Zuellig  ')
    component.carriesDn.set(true)
    component.carriesHu.set(true)
    component.billCount.set('7')
    component.truckPlate.set(' 1กข 1234 ')

    component.submit()

    expect(emitted).toEqual([{
      supplierName: 'Zuellig', compCode: null, compType: null, carriesDn: true, carriesHu: true,
      billCount: 7, truckPlate: '1กข 1234', driverPhone: null, note: null, orders: [],
    }])
  })

  it('previews the size class from the bill count', () => {
    component.billCount.set('1')
    expect(component.size()).toBe('S')
    component.billCount.set('6')
    expect(component.size()).toBe('L')
    component.billCount.set('x')
    expect(component.size()).toBeNull()
    expect(component.errors().billCount).toBeTruthy()
  })

  it('searches suppliers after a pause and attaches the picked vendor code and company', async () => {
    component.typeSupplier('ทดสอบ')
    await settle()

    expect(api.searchSuppliers).toHaveBeenCalledWith('ทดสอบ')
    expect(component.suggestions().length).toBe(1)

    component.pick(component.suggestions()[0])
    await settle()

    expect(component.supplierName()).toBe('บริษัท ทดสอบ')
    expect(component.carriesHu()).toBeTrue()
    expect(component.suggestions()).toEqual([])

    component.submit()
    expect(emitted[0].compCode).toBe('S001')
    expect(emitted[0].compType).toBe('HU')
  })

  it('drops the vendor code when the name is edited after picking', () => {
    component.pick({ compCode: 'S001', compName: 'บริษัท ทดสอบ', compType: 'HU' })
    component.typeSupplier('บริษัท อื่น')

    component.submit()

    expect(emitted[0].compCode).toBeNull()
    expect(emitted[0].carriesHu).toBeTrue()
  })

  it('does not emit while busy, and reset clears the form', () => {
    component.typeSupplier('DKSH')
    component.carriesDn.set(true)
    fixture.componentRef.setInput('busy', true)

    component.submit()
    expect(emitted).toEqual([])

    component.reset()
    expect(component.supplierName()).toBe('')
    expect(component.carriesDn()).toBeFalse()
    expect(component.touched()).toBeFalse()
  })
})
