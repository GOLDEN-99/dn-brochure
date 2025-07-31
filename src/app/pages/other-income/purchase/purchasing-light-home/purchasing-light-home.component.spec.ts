import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasingLightHomeComponent } from './purchasing-light-home.component';

describe('PurchasingLightHomeComponent', () => {
  let component: PurchasingLightHomeComponent;
  let fixture: ComponentFixture<PurchasingLightHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasingLightHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasingLightHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
