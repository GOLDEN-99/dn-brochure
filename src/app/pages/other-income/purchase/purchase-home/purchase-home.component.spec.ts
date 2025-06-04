import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseHomeComponent } from './purchase-home.component';

describe('PurchaseHomeComponent', () => {
  let component: PurchaseHomeComponent;
  let fixture: ComponentFixture<PurchaseHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
