import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { OtherIncomeEmplAuthService } from '../other-income/shared/services/other-income-empl-auth.service';
import { ToastService } from '../service/toast/toast.service';
import { BranchPharmacistPageComponent } from './branch-pharmacist-page.component';
import { BranchPharmacistService } from './branch-pharmacist.service';
import { TBranchPharmacist, TPharmacistCandidate } from './branch-pharmacist.types';

const branch = (code: string, over: Partial<TBranchPharmacist> = {}): TBranchPharmacist => ({
  branchCode: code, branchName: 'สาขา ' + code, isGpp: false,
  licenceNo: null, licenceUpdatedBy: null, licenceUpdatedAt: null,
  assignmentId: null, pharmacistCode: null, pharmacistName: null, pharmacistEligible: null,
  assignedAt: null, assignedBy: null,
  ...over,
})

const CANDIDATE: TPharmacistCandidate = { emplCode: '2002', emplName: 'ภก. สมชาย', emplGroupCode: 5, homeBranchCode: '1', activeBranchCount: 0 }
const WITH_PHARMACIST = { assignmentId: 7, pharmacistCode: '2001', pharmacistName: 'ภญ. สมศรี', pharmacistEligible: true, assignedAt: '2026-11-01T09:00:00', assignedBy: '4065' }

describe('BranchPharmacistPageComponent', () => {
  let fixture: ComponentFixture<BranchPharmacistPageComponent>
  let component: BranchPharmacistPageComponent
  let service: jasmine.SpyObj<BranchPharmacistService>
  let toast: jasmine.SpyObj<ToastService>

  const create = async (branches: TBranchPharmacist[]) => {
    service = jasmine.createSpyObj<BranchPharmacistService>('BranchPharmacistService',
      ['list', 'history', 'getCandidates', 'setLicence', 'assign', 'end'])
    service.list.and.returnValue(of(branches))
    service.history.and.returnValue(of([]))
    service.getCandidates.and.returnValue(of([CANDIDATE]))
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'danger'])

    await TestBed.configureTestingModule({
      imports: [BranchPharmacistPageComponent],
      providers: [
        { provide: BranchPharmacistService, useValue: service },
        { provide: ToastService, useValue: toast },
        { provide: OtherIncomeEmplAuthService, useValue: { employee: signal({ emplCode: '4065', emplName: 'ผู้ทดสอบ' }) } },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(BranchPharmacistPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? ''

  it('flags a branch with no pharmacist as unable to print', async () => {
    await create([branch('1'), branch('2', { licenceNo: 'ขย.2/2569', ...WITH_PHARMACIST })])

    expect(component.summary()).toEqual({ total: 2, ready: 1, noPharmacist: 1, noLicence: 1, review: 0 })
    expect(text()).toContain('พิมพ์ ข.ย. ไม่ได้')
    expect(text()).toContain('2001 ภญ. สมศรี')
  })

  it('opening a branch loads its history and the candidates, and seeds the licence draft', async () => {
    const b = branch('1', { licenceNo: 'ขย.1/2569' })
    await create([b])

    component.toggle(b)
    fixture.detectChanges()

    expect(service.history).toHaveBeenCalledOnceWith('1')
    expect(service.getCandidates).toHaveBeenCalledTimes(1)
    expect(component.licenceDraft()).toBe('ขย.1/2569')
    expect(component.licenceChanged()).toBeFalse()
    expect(text()).toContain('2002 ภก. สมชาย')
  })

  it('saves a changed licence with the signed-in employee and shows the returned row', async () => {
    const b = branch('1')
    await create([b])
    service.setLicence.and.returnValue(of(branch('1', { licenceNo: 'ขย.9/2569' })))

    component.toggle(b)
    component.licenceDraft.set('  ขย.9/2569 ')
    component.saveLicence()

    expect(service.setLicence).toHaveBeenCalledOnceWith('1', 'ขย.9/2569', '4065')
    expect(component.branches()[0].licenceNo).toBe('ขย.9/2569')
    expect(toast.success).toHaveBeenCalled()
  })

  it('assigns the picked pharmacist, then reloads history and the candidate counts', async () => {
    const b = branch('1')
    await create([b])
    service.assign.and.returnValue(of(branch('1', { ...WITH_PHARMACIST, pharmacistCode: '2002', pharmacistName: 'ภก. สมชาย' })))

    component.toggle(b)
    component.assign()                       // nothing picked yet
    expect(service.assign).not.toHaveBeenCalled()

    component.pick(CANDIDATE)
    component.assign()

    expect(service.assign).toHaveBeenCalledOnceWith('1', '2002', '4065')
    expect(component.branches()[0].pharmacistCode).toBe('2002')
    expect(component.picked()).toBeNull()
    expect(service.history).toHaveBeenCalledTimes(2)
    expect(service.getCandidates).toHaveBeenCalledWith(true)
  })

  it('ends an assignment only on the second click', async () => {
    const b = branch('1', WITH_PHARMACIST)
    await create([b])
    service.end.and.returnValue(of(branch('1')))

    component.toggle(b)
    component.end()
    expect(component.endArmed()).toBeTrue()
    expect(service.end).not.toHaveBeenCalled()

    component.end()
    expect(service.end).toHaveBeenCalledOnceWith('1', '4065')
    expect(component.branches()[0].pharmacistCode).toBeNull()
  })

  it('shows the API reason when a write is refused and keeps the row as it was', async () => {
    const b = branch('1')
    await create([b])
    service.assign.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 400, error: { message: 'Validation failed', errors: { pharmacistCode: ['พนักงานรหัส 2002 ไม่ได้อยู่ในกลุ่มเภสัชกร'] } },
    })))

    component.toggle(b)
    component.pick(CANDIDATE)
    component.assign()
    fixture.detectChanges()

    expect(component.editorError()).toBe('พนักงานรหัส 2002 ไม่ได้อยู่ในกลุ่มเภสัชกร')
    expect(text()).toContain('ไม่ได้อยู่ในกลุ่มเภสัชกร')
    expect(component.branches()[0].pharmacistCode).toBeNull()
    expect(component.busy()).toBeNull()
  })

  it('reports a failed load instead of an empty table', async () => {
    await create([])
    service.list.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })))

    component.load()
    fixture.detectChanges()

    expect(component.error()).toBe('โหลดรายการสาขาไม่สำเร็จ')
    expect(component.loading()).toBeFalse()
  })
})
