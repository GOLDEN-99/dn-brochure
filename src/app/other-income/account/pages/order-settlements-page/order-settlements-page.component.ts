import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderContractContextService } from '../../../purchase/services/order-contract-context.service';

@Component({
  selector: 'app-order-settlements-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './order-settlements-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './order-settlements-page.component.scss',
})
export class OrderSettlementsPageComponent {
  readonly ctx = inject(OrderContractContextService)
}
