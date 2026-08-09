import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SupplierReserveAddComponent } from './supplier-reserve-add.component';

describe('SupplierReserveAddComponent', () => {
  let component: SupplierReserveAddComponent;
  let fixture: ComponentFixture<SupplierReserveAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierReserveAddComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierReserveAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
