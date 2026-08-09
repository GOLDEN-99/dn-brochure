import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { OtherIncomeIncomeSelectComponent } from './other-income-income-select.component';
import { TIncomeLabel } from '../../types/other-income.type';

describe('OtherIncomeIncomeSelectComponent', () => {
  let component: OtherIncomeIncomeSelectComponent;
  let fixture: ComponentFixture<OtherIncomeIncomeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeIncomeSelectComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeIncomeSelectComponent);
    component = fixture.componentInstance;
    // `form` needs an injection context; in the app the parent owns the FieldTree and passes a
    // sub-field down (see create-paired-order-contract: [form]="createForm.head.bill").
    const model = signal<TIncomeLabel | null>(null);
    const fieldTree = TestBed.runInInjectionContext(() => form(model));
    fixture.componentRef.setInput('form', fieldTree);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
