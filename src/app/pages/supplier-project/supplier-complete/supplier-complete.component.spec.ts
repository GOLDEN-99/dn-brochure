import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierCompleteComponent } from './supplier-complete.component';

describe('SupplierCompleteComponent', () => {
  let component: SupplierCompleteComponent;
  let fixture: ComponentFixture<SupplierCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierCompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
