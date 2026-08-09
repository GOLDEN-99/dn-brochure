import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OtherIncomeSearchCompService } from '../../../services/other-income-search-comp.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BranchContractCreatePageComponent } from './branch-contract-create-page.component';

describe('BranchContractCreatePageComponent', () => {
  let component: BranchContractCreatePageComponent;
  let fixture: ComponentFixture<BranchContractCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchContractCreatePageComponent],
      providers: [OtherIncomeSearchCompService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchContractCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
