import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PromoContractContextService } from '../../../purchase/services/promo-contract-context.service';

@Component({
  selector: 'app-promo-settlements-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './promo-settlements-page.component.html',
  styleUrl: './promo-settlements-page.component.scss',
})
export class PromoSettlementsPageComponent {
  readonly ctx = inject(PromoContractContextService)
}
