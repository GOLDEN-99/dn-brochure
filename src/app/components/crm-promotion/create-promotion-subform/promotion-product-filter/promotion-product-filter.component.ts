import { Component, computed, inject, input, signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { TPromotionFilterState } from '../../../../types/crm-promotion.type';
import { PromotionFilterComponent } from '../../promotion-filter/promotion-filter.component';
import { CRM_PAGE_CONFIG } from '../../../../service/crm-promotion/crm-token';
import { TCreatePromotionForm } from '../../../../pages/crm-promotion/create/create-bill-discount-promotion/createPromotionSchema';
import { FormAlertTextComponent } from '../../form-alert-text.component';

@Component({
  selector: 'app-promotion-product-filter',
  imports: [PromotionFilterComponent, FormAlertTextComponent],
  templateUrl: './promotion-product-filter.component.html',
  styles: '',
})
export class PromotionProductFilterComponent {
  private readonly config = inject(CRM_PAGE_CONFIG);
  showItem = signal(this.config.filterOption.showItem);
  form = input.required<FieldTree<TCreatePromotionForm>>();

  private readonly filterProductLists = computed(() =>
    this.form()
      .promotionFilter()
      .value()
      .map(({ productList }) => productList),
  );

  otherGroupProducts(index: number) {
    return this.filterProductLists().flatMap((list, i) =>
      i === index ? [] : list,
    );
  }

  onDeleteFilter(index: number) {
    this.form()
      .promotionFilter()
      .controlValue.update((filters) => filters.filter((_, i) => i !== index));
  }
}
