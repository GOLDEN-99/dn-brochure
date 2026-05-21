import { Directive, input } from '@angular/core';
import { FormField, MaybeFieldTree } from '@angular/forms/signals';

@Directive({
  selector: '[numericInput]',
  providers: [FormField],
  standalone: true,
  host: {
    'type': 'text',
    'inputMode': 'numberic'
  } 
})
export class NumericInputDirective {
}
