import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierProductPageComponent } from './supplier-product-page.component';

describe('SupplierProductPageComponent', () => {
  let component: SupplierProductPageComponent;
  let fixture: ComponentFixture<SupplierProductPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierProductPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierProductPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
