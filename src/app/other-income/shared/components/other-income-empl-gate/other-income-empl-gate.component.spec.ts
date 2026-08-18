import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OtherIncomeEmplGateComponent } from './other-income-empl-gate.component';
import { OtherIncomeEmplAuthService } from '../../services/other-income-empl-auth.service';
import { signal } from '@angular/core';

describe('OtherIncomeEmplGateComponent', () => {
  let fixture: ComponentFixture<OtherIncomeEmplGateComponent>;
  let checked: ReturnType<typeof signal<boolean>>;
  let employee: ReturnType<typeof signal<{ emplCode: string; emplName: string } | null>>;

  beforeEach(async () => {
    checked = signal(false)
    employee = signal(null)

    await TestBed.configureTestingModule({
      imports: [OtherIncomeEmplGateComponent],
      providers: [
        { provide: OtherIncomeEmplAuthService, useValue: { checked, employee } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OtherIncomeEmplGateComponent);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows a loading state while not yet checked', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string
    expect(text).toContain('กำลังตรวจสอบสิทธิ์ผู้ใช้งาน')
  });

  it('shows a blocked message when checked but no employee resolved', () => {
    checked.set(true)
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string
    expect(text).toContain('ไม่พบข้อมูลพนักงาน')
  });

  it('renders the router outlet once an employee is resolved', () => {
    checked.set(true)
    employee.set({ emplCode: 'E1', emplName: 'Somchai' })
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
