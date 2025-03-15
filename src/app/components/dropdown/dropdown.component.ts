import { Component, input } from '@angular/core';
import { TDropdownProps } from '../../types';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss'
})
export class DropdownComponent {
  options = input.required<TDropdownProps[]>()
  control = input.required<FormControl>()
}
