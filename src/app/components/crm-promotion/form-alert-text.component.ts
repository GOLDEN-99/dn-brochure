import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { FieldState } from '@angular/forms/signals';

@Component({
  selector: 'app-form-alert-text',
  imports: [],
  template: `
  @if (showErrors()) {
  <div class="d-flex flex-column text-danger">
    @for (e of formState().errors(); track $index) {
      <span>*** {{e.message}}</span>
    }
  </div>
  }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: '',
})
export class FormAlertTextComponent {
  formState = input.required<FieldState<unknown>>()

  // A pristine create page seeds zeros (a 0 reward is "does nothing at the till",
  // which the schema rejects), so an ungated alert greets the author with errors
  // for fields they have not reached yet. Gate on touched: the field still blocks
  // submit, it just does not shout before being visited. Pass alwaysShow for
  // cross-field errors on a node the user never focuses -- a tier ladder or a
  // filter group -- where nothing would ever mark it touched.
  readonly alwaysShow = input(false)

  readonly showErrors = computed(
    () =>
      this.formState().errors().length > 0 &&
      (this.alwaysShow() || this.formState().touched()),
  )
}
