import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierInhouseComponent } from './supplier-inhouse.component';

describe('SupplierInhouseComponent', () => {
  let component: SupplierInhouseComponent;
  let fixture: ComponentFixture<SupplierInhouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierInhouseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierInhouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
