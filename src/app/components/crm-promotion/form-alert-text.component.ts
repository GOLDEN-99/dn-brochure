import { Component, input } from '@angular/core';
import { FieldState } from '@angular/forms/signals';

@Component({
  selector: 'app-form-alert-text',
  imports: [],
  template: `
  @let dayactiveErr = formState().errors();
  @if (dayactiveErr.length > 0) {
  <div class="d-flex flex-column text-danger">
    @for (e of dayactiveErr; track $index) {
      <span>*** {{e.message}}</span>
    }
  </div>
  }
  `,
  styles: '',
})
export class FormAlertTextComponent {
  formState = input.required<FieldState<unknown>>()
}
