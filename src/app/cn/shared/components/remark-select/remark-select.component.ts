import { Component, inject, input, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { TReamrk } from '../../types/cn.type';
import { CnRemarkService } from '../../../../service/cn/cn-remark/cn-remark.service';
import { FormsModule } from '@angular/forms';
import { TMaybe } from '../../../../types';

@Component({
  selector: 'app-remark-select',
  imports: [FormsModule],
  templateUrl: './remark-select.component.html',
  styles: '',
})
export class RemarkSelectComponent implements FormValueControl<TMaybe<TReamrk>> {
  private readonly remarkServ = inject(CnRemarkService)
  value = model<TMaybe<TReamrk>>(null)
  remarkList = this.remarkServ.remarkSignal
  disabled = input(false)
  readonly = input(false)
  touched = model(false)
  name = input('remark-option-select')
  required = input(false)
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  onBlur() {
    this.touched.set(true)
  }
  compareRemarkFn(opt1: any, opt2: any): boolean {
    return opt1 && opt2 ? opt1.id === opt2.id : opt1 === opt2;
  }

}
