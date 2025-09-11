import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IbobCompService, TCompGroup } from '../../../service/supplier/ibob-comp.service';

@Component({
  selector: 'app-supllier-select',
  imports: [FormsModule],
  templateUrl: './supllier-select.component.html',
  styles: ''
})
export class SupllierSelectComponent {
  private compService = inject(IbobCompService)
  compGroupCode = model.required<string>()
  optionsList = this.compService.compGroup
  compareFunc = input<TCompareFunction<TCompGroup>>((o1, o2) => o1 && o2 ? o1.compGroupCode === o2.compGroupCode : o1 === o2)
}

export interface IOption {
  id: number
  label: string
}

type TCompareFunction<T> = (o1: T | null | undefined, o2: T | null | undefined) => boolean
