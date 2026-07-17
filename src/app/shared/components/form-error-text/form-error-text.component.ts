import { Component, input } from '@angular/core';
import { FieldState } from '@angular/forms/signals';

@Component({
  selector: 'app-form-error-text',
  imports: [],
  templateUrl: './form-error-text.component.html',
  styleUrl: './form-error-text.component.scss',
})
export class FormErrorTextComponent {
  formState = input.required<FieldState<unknown>>()
}
