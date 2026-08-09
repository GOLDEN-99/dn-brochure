import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';

import { FormErrorTextComponent } from './form-error-text.component';

describe('FormErrorTextComponent', () => {
  let component: FormErrorTextComponent;
  let fixture: ComponentFixture<FormErrorTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrorTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormErrorTextComponent);
    component = fixture.componentInstance;
    // The template reads formState().errors(), so the input is a FieldState -- obtained by
    // calling a FieldTree. `form` requires an injection context.
    const fieldTree = TestBed.runInInjectionContext(() => form(signal('')));
    fixture.componentRef.setInput('formState', fieldTree());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
