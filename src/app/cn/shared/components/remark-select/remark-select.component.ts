import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { TRemark } from '../../types/cn.type';
import { FormsModule } from '@angular/forms';
import { TMaybe } from '../../../../types';
import { CnApiService } from '../../services/cn-api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filterRemarkByGroup, hasRemarkGroup, isInGroup, REMARK_CATEGORIES, TRemarkCategory } from '../../libs/remark-group';

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

  categoryOption = REMARK_CATEGORIES
  category = signal<TMaybe<TRemarkCategory>>(null)

  // ซ่อนตัวกรองถ้า api ยังไม่ส่ง remarkGroup มา แล้วแสดงสาเหตุทั้งหมดตามเดิม
  showCategory = computed(() => hasRemarkGroup(this.remarkList()))

  remarkOption = computed(() => filterRemarkByGroup(this.category())(this.remarkList()))

  // เปลี่ยนหมวดแล้วสาเหตุที่เลือกไว้ต้องไม่ค้างอยู่นอกหมวดใหม่
  private readonly clearOutOfGroup = effect(() => {
    const cate = this.category()
    if (!isInGroup(this.value(), cate)) this.value.set(null)
  })

  onBlur() {
    this.touched.set(true)
  }
  compareRemarkFn(opt1: any, opt2: any): boolean {
    return opt1 && opt2 ? opt1.id === opt2.id : opt1 === opt2;
  }
  compareCategoryFn(opt1: any, opt2: any): boolean {
    return opt1 && opt2 ? opt1.id === opt2.id : opt1 === opt2;
  }
}
