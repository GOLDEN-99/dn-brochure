import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OtherIncomeSearchCompService } from '../../../services/other-income-search-comp.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PromoContractCreatePageComponent } from './promo-contract-create-page.component';

describe('PromoContractCreatePageComponent', () => {
  let component: PromoContractCreatePageComponent;
  let fixture: ComponentFixture<PromoContractCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoContractCreatePageComponent],
      providers: [OtherIncomeSearchCompService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
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
