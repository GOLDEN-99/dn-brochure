import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { PromoContractContextService } from '../../../../purchase/services/promo-contract-context.service';

@Component({
  selector: 'app-account-promo-contract-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe],
  templateUrl: './account-promo-contract-layout.component.html',
  styleUrl: './account-promo-contract-layout.component.scss',
})
export class AccountPromoContractLayoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly location = inject(Location)
  readonly ctx = inject(PromoContractContextService)

  ngOnInit(): void {
    this.ctx.load(+this.route.snapshot.params['id']);
  }

  goBack(): void {
    this.location.back();
  }
}
