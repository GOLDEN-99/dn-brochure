import { Component, computed, ElementRef, input, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError } from '@angular/forms/signals';

let ref = 0;

@Component({
  selector: 'app-radio',
  imports: [FormsModule],
  templateUrl: './radio.component.html',
  styles: '',
})
export class RadioComponent<T> implements FormValueControl<T> {
  radioValue = input.required<T>()
  className = input('form-check-input')
  value = model.required<T>()
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([])
  disabled = input(false)
  readonly = input(false)
  invalid = input(false)
  touched = model(false)
  dirty = input(false)
  name = input(`input-radio-${ref++}`)
  id = computed(() => `${this.name()}-${this.radioValue()}`)
  required = input(false)
  private readonly ref = viewChild<ElementRef<HTMLInputElement>>('myRadio')
  focus?(options?: FocusOptions): void {
    this.ref()?.nativeElement.focus(options)
  }
  onBlur() {
    this.touched.set(true)
  }
}

type TRadioCompare<In, Out extends string | number> = (value: In) => Out
