import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TDropdownProps } from '../../types';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-dropdown',
    imports: [ReactiveFormsModule],
    templateUrl: './dropdown.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './dropdown.component.scss'
})
export class DropdownComponent {
  options = input.required<TDropdownProps[]>()
  control = input.required<FormControl>()
}
