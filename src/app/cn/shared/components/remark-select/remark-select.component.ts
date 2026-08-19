import { Component, computed, effect, inject, input, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { TRemark, TRemarkCategory } from '../../types/cn.type';
import { FormsModule } from '@angular/forms';
import { TMaybe } from '../../../../types';
import { CnApiService } from '../../services/cn-api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filterRemarkByGroup, isInGroup } from '../../libs/remark-group';

@Component({
  selector: 'app-remark-select',
  imports: [FormsModule],
  templateUrl: './remark-select.component.html',
  styles: '',
})
export class RemarkSelectComponent implements FormValueControl<TMaybe<TRemark>> {
  private readonly cnClient = inject(CnApiService)
  private readonly remarkList = toSignal(this.cnClient.getRemark(), { initialValue: [] })

  value = model<TMaybe<TRemark>>(null)
  disabled = input(false)
  readonly = input(false)
  touched = model(false)
  name = input('remark-option-select')
  required = input(false)
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  // หมวดที่เลือกอยู่ เก็บใน CnStateService จึงไม่หายเมื่อกลับมาหน้านี้
  category = input<TMaybe<TRemarkCategory>>(null)

  remarkOption = computed(() => filterRemarkByGroup(this.category())(this.remarkList()))

  // เปลี่ยนหมวดแล้วสาเหตุที่เลือกไว้ต้องไม่ค้างอยู่นอกหมวดใหม่
  private readonly clearOutOfGroup = effect(() => {
    if (!isInGroup(this.value(), this.category())) this.value.set(null)
  })

  onBlur() {
    this.touched.set(true)
  }
  compareRemarkFn(opt1: any, opt2: any): boolean {
    return opt1 && opt2 ? opt1.id === opt2.id : opt1 === opt2;
  }
}
