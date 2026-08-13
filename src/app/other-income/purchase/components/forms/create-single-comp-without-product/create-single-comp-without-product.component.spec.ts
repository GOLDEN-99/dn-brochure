import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OtherIncomeSearchCompService } from '../../../services/other-income-search-comp.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CreateSingleCompWithoutProductComponent } from './create-single-comp-without-product.component';

describe('CreateSingleCompWithoutProductComponent', () => {
  let component: CreateSingleCompWithoutProductComponent;
  let fixture: ComponentFixture<CreateSingleCompWithoutProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSingleCompWithoutProductComponent],
      providers: [OtherIncomeSearchCompService, provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSingleCompWithoutProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
