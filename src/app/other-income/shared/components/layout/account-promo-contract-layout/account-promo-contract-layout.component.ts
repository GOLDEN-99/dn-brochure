import { Component, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { PromoContractContextService } from '../../../../purchase/services/promo-contract-context.service';

@Component({
  selector: 'app-account-promo-contract-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe],
  templateUrl: './account-promo-contract-layout.component.html',
  styleUrl: './account-promo-contract-layout.component.scss',
})
export class AccountPromoContractLayoutComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly location = inject(Location)
  readonly ctx = inject(PromoContractContextService)

  constructor() {
    const routeParams = toSignal(this.route.params, { initialValue: this.route.snapshot.params })
    effect(() => {
      const raw = routeParams()['id']
      if (raw === undefined) return
      this.ctx.setId(+raw)
    })
  }

  goBack(): void {
    this.location.back();
  }
}
