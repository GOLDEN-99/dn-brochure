import { Component, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supllier-select',
  imports: [FormsModule],
  templateUrl: './supllier-select.component.html',
  styleUrl: './supllier-select.component.scss'
})
export class SupllierSelectComponent {
  selectedOption = model<IOption | null>(null)
  optionsList = signal<IOption[]>([
    { id: 0, label: 'กรุณาเลือก' },
    { id: 1, label: 'supplier 1' },
    { id: 2, label: 'supplier 2' }
  ])
  compareFunc = input<TCompareFunction>((o1, o2) => o1 && o2 ? o1.id === o2.id : o1 === o2)
}

export interface IOption {
  id: number
  label: string
}

type TCompareFunction = (o1: IOption, o2: IOption) => boolean
