import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { OtherIncomeEventSelectComponent } from './other-income-event-select.component';
import { TContractLabel } from '../../types/other-income.type';

describe('OtherIncomeEventSelectComponent', () => {
  let component: OtherIncomeEventSelectComponent;
  let fixture: ComponentFixture<OtherIncomeEventSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherIncomeEventSelectComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherIncomeEventSelectComponent);
    component = fixture.componentInstance;
    // `form` needs an injection context; the parent owns the FieldTree and passes a sub-field.
    const model = signal<TContractLabel | null>(null);
    const fieldTree = TestBed.runInInjectionContext(() => form(model));
    fixture.componentRef.setInput('form', fieldTree);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
