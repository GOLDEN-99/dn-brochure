import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierReserveLayoutComponent } from './supplier-reserve-layout.component';

describe('SupplierReserveLayoutComponent', () => {
  let component: SupplierReserveLayoutComponent;
  let fixture: ComponentFixture<SupplierReserveLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierReserveLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierReserveLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
