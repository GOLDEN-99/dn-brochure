import { Component, inject, input, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductGroupConfigService } from '../../../../service/crm-promotion/product-group-config.service';

@Component({
  selector: 'app-edit-product-config',
  imports: [RouterLink],
  templateUrl: './edit-product-config.component.html',
  styleUrl: './edit-product-config.component.scss'
})
export class EditProductConfigComponent {
  private readonly groupConfig = inject(ProductGroupConfigService)

  productGroupId = input<number>()

  constructor() {
    effect(() => {
      const id = this.productGroupId()
      if (id !== undefined) this.groupConfig.groupId.set(id)
    })
  }

  readonly currentProductInGroup = this.groupConfig.currentProductInGroup
}
