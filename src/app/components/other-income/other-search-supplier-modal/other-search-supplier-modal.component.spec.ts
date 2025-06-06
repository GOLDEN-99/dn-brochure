import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherSearchSupplierModalComponent } from './other-search-supplier-modal.component';

describe('OtherSearchSupplierModalComponent', () => {
  let component: OtherSearchSupplierModalComponent;
  let fixture: ComponentFixture<OtherSearchSupplierModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherSearchSupplierModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherSearchSupplierModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
