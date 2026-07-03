import { Component, inject } from '@angular/core';
import { PromoContractContextService } from '../../../../purchase/services/promo-contract-context.service';

@Component({
  selector: 'app-promo-contract-specs-page',
  imports: [],
  templateUrl: './promo-contract-specs-page.component.html',
  styles: '',
})
export class PromoContractSpecsPageComponent {
  readonly ctx = inject(PromoContractContextService)
}
