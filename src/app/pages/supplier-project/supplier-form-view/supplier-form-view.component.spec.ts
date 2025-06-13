import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierFormViewComponent } from './supplier-form-view.component';

describe('SupplierFormViewComponent', () => {
  let component: SupplierFormViewComponent;
  let fixture: ComponentFixture<SupplierFormViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierFormViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierFormViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
