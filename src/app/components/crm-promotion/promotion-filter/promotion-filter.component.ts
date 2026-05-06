import {
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import {
  TConfigGroup,
  TPromotionFilterState,
  TPromotionProductBase,
} from '../../../types/crm-promotion.type';
import { ProductConfigService } from '../../../service/crm-promotion/product-config.service';
import { map, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ProductPickerComponent } from '../product-picker/product-picker.component';
import { ProductNamePipe } from '../../../lib/crm-promotion/product-name.pipe';
import { PromotionThresholdPipe } from '../../../lib/crm-promotion/promotion-threshold.pipe';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormAlertTextComponent } from '../form-alert-text.component';

let id = 0;

@Component({
  selector: 'app-promotion-filter',
  imports: [
    FormsModule,
    ProductPickerComponent,
    ProductNamePipe,
    PromotionThresholdPipe,
    FormField,
    FormAlertTextComponent,
  ],
  templateUrl: './promotion-filter.component.html',
  styles: '',
})
export class PromotionFilterComponent {
  readonly id!: number;
  constructor() {
    this.id = id++;
  }
  private readonly productService = inject(ProductConfigService);
  private readonly allProducts = this.productService.allProduct;
  promotionProductGroup = this.productService.allPromotionProductGroup;

  searchPromotionProductGroup(term$: Observable<string>) {
    return term$.pipe(
      map((t) =>
        this.promotionProductGroup().filter((p) =>
          p.name.toLocaleLowerCase().includes(t),
        ),
      ),
    );
  }
  formatPromotionProductGroup({ name }: TConfigGroup) {
    return name;
  }

  readonly form = input.required<FieldTree<TPromotionFilterState>>();

  readonly currentProductList = computed(() =>
    this.form().productList().value(),
  );
  readonly currentProduct = computed(
    () => new Set(this.currentProductList().map((p) => p.goodCode)),
  );
  validProduct = computed(() => {
    const ref = this.currentProduct();
    return this.allProducts().filter((p) => !ref.has(p.goodCode));
  });

  onRemoveProduct(goodCode: string) {
    this.form()
      .productList()
      .controlValue.update((products) =>
        products.filter((product) => product.goodCode !== goodCode),
      );
  }

  onUpdateProductList(addProductList: TPromotionProductBase[]) {
    this.form()
      .productList()
      .controlValue.update((prev) => [...prev, ...addProductList]);
  }
}
