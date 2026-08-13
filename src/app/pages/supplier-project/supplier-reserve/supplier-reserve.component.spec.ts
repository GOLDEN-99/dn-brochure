import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SupplierReserveComponent } from './supplier-reserve.component';

describe('SupplierReserveComponent', () => {
  let component: SupplierReserveComponent;
  let fixture: ComponentFixture<SupplierReserveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierReserveComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierReserveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
