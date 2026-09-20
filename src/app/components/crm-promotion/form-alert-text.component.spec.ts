import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { FormAlertTextComponent } from './form-alert-text.component';

// The create pages seed zeros and empty names, so the schema legitimately reports
// errors on a form the author has not touched yet. These specs pin that the alert
// stays quiet until the field is visited, without letting cross-field errors on
// container nodes — which nothing ever marks touched — go unreported.
function alertFor(opts: { touched: boolean; alwaysShow?: boolean }) {
  return TestBed.runInInjectionContext(() => {
    const model = signal({ name: '' });
    const f = form(model, (p) => required(p.name, { message: 'ต้องระบุชื่อ' }));
    const field = f.name();
    if (opts.touched) field.markAsTouched();

    const fixture = TestBed.createComponent(FormAlertTextComponent);
    fixture.componentRef.setInput('formState', field);
    if (opts.alwaysShow !== undefined) {
      fixture.componentRef.setInput('alwaysShow', opts.alwaysShow);
    }
    fixture.detectChanges();
    return {
      component: fixture.componentInstance,
      text: (fixture.nativeElement as HTMLElement).textContent ?? '',
    };
  });
}

describe('FormAlertTextComponent', () => {
  it('stays quiet on an untouched field that already has errors', () => {
    const { component, text } = alertFor({ touched: false });
    expect(component.showErrors()).toBeFalse();
    expect(text).not.toContain('ต้องระบุชื่อ');
  });

  it('shows the error once the field is touched', () => {
    const { component, text } = alertFor({ touched: true });
    expect(component.showErrors()).toBeTrue();
    expect(text).toContain('ต้องระบุชื่อ');
  });

  // Cross-field errors live on array/group nodes the user never focuses, so
  // touched never flips and gating alone would silence them permanently.
  it('shows an untouched error when alwaysShow is set', () => {
    const { component, text } = alertFor({ touched: false, alwaysShow: true });
    expect(component.showErrors()).toBeTrue();
    expect(text).toContain('ต้องระบุชื่อ');
  });

  it('shows nothing when there are no errors, even with alwaysShow', () => {
    const result = TestBed.runInInjectionContext(() => {
      const model = signal({ name: 'ok' });
      const f = form(model, (p) => required(p.name, { message: 'ต้องระบุชื่อ' }));
      const fixture = TestBed.createComponent(FormAlertTextComponent);
      fixture.componentRef.setInput('formState', f.name());
      fixture.componentRef.setInput('alwaysShow', true);
      fixture.detectChanges();
      return fixture.componentInstance.showErrors();
    });
    expect(result).toBeFalse();
  });
});
