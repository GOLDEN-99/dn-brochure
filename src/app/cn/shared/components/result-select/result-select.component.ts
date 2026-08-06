import { Component, computed, input, InputSignal, InputSignalWithTransform, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { TMaybe } from '../../../../types';
import { TRemarkResult } from '../../types/cn.type';
import { TResultType } from '../../libs/remark-result';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'cn-result-select',
  imports: [FormsModule],
  templateUrl: './result-select.component.html',
  styles: '',
})
export class ResultSelectComponent implements FormValueControl<TMaybe<TRemarkResult>> {
  value = model<TMaybe<TRemarkResult>>(null)
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  resultType = input.required<TResultType>()

  resultOption = computed<Array<TRemarkResult>>(() => {
    const resultType = this.resultType()
    switch (resultType) {
      case 'none': return []
      case 'notChange': return [{ result: 'ลูกค้าไม่รับ', id: '0' }, { result: 'ลูกค้ารับ', id: '1' }]
      case 'all': return [{ result: 'ลูกค้าไม่รับ', id: '0' }, { result: 'ลูกค้ารับ', id: '1' }, { result: 'ลูกค้ารับเปลี่ยน', id: '2' }]
      case 'notAccept': return [{ result: 'ลูกค้าไม่รับ', id: '0' }, { result: 'ลูกค้ารับเปลี่ยน', id: '2' }]
      case 'mustReject': return [{ result: 'ลูกค้าไม่รับ', id: '0' }]
    }
  })


  disabled = input(false)
  readonly = input(false)
  touched = model(false)
  name = input('result-option-select')
  required = input(false)
  onBlur() {
    this.touched.set(true)
  }
  compareRemarkFn(opt1: any, opt2: any): boolean {
    return opt1 && opt2 ? opt1.id === opt2.id : opt1 === opt2;
  }
}
