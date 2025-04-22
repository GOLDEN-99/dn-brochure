import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierReserveComponent } from './supplier-reserve.component';

describe('SupplierReserveComponent', () => {
  let component: SupplierReserveComponent;
  let fixture: ComponentFixture<SupplierReserveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierReserveComponent]
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
