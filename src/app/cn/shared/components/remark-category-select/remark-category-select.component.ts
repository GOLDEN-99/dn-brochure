import { Component, computed, inject, input, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { TMaybe } from '../../../../types';
import { CnApiService } from '../../services/cn-api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { hasRemarkGroup, REMARK_CATEGORIES } from '../../libs/remark-group';
import { TRemarkCategory } from '../../types/cn.type';

@Component({
  selector: 'cn-remark-category-select',
  imports: [FormsModule],
  templateUrl: './remark-category-select.component.html',
  styles: '',
})
export class RemarkCategorySelectComponent implements FormValueControl<TMaybe<TRemarkCategory>> {
  private readonly cnClient = inject(CnApiService)
  private readonly remarkList = toSignal(this.cnClient.getRemark(), { initialValue: [] })

  value = model<TMaybe<TRemarkCategory>>(null)
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  disabled = input(false)
  readonly = input(false)
  touched = model(false)
  name = input('remark-category-select')
  required = input(false)

  categoryOption = REMARK_CATEGORIES

  // ซ่อนทั้งช่องถ้า api ยังไม่ส่ง remarkGroup มา — กรองไม่ได้ก็ไม่ต้องให้เลือก
  show = computed(() => hasRemarkGroup(this.remarkList()))

  onBlur() {
    this.touched.set(true)
  }
  compareCategoryFn(opt1: any, opt2: any): boolean {
    return opt1 && opt2 ? opt1.id === opt2.id : opt1 === opt2;
  }
}
