import { Component, inject, input, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { TRemark } from '../../types/cn.type';
import { FormsModule } from '@angular/forms';
import { TMaybe } from '../../../../types';
import { CnApiService } from '../../services/cn-api.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-remark-select',
  imports: [FormsModule],
  templateUrl: './remark-select.component.html',
  styles: '',
})
export class RemarkSelectComponent implements FormValueControl<TMaybe<TRemark>> {
  private readonly cnClient = inject(CnApiService)
  value = model<TMaybe<TRemark>>(null)
  remarkList = toSignal(this.cnClient.getRemark(), { initialValue: [] })
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
