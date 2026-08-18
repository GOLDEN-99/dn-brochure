import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoContractCreatePageComponent } from './promo-contract-create-page.component';

describe('PromoContractCreatePageComponent', () => {
  let component: PromoContractCreatePageComponent;
  let fixture: ComponentFixture<PromoContractCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoContractCreatePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromoContractCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
