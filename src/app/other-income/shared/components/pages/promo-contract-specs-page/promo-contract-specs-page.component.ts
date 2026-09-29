import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { PromoContractContextService } from '../../../../purchase/services/promo-contract-context.service';

@Component({
  selector: 'app-promo-contract-specs-page',
  imports: [],
  templateUrl: './promo-contract-specs-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: '',
})
export class PromoContractSpecsPageComponent {
  readonly ctx = inject(PromoContractContextService)
}
