import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherIncomeCreateLightboxComponent } from './other-income-create-lightbox.component';

describe('OtherIncomeCreateLightboxComponent', () => {
  let component: OtherIncomeCreateLightboxComponent;
  let fixture: ComponentFixture<OtherIncomeCreateLightboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeCreateLightboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeCreateLightboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
