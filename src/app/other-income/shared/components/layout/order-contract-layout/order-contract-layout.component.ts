import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderContractContextService } from '../../../../purchase/services/order-contract-context.service';

@Component({
  selector: 'app-order-contract-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe],
  templateUrl: './order-contract-layout.component.html',
  styles: '',
})
export class OrderContractLayoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  readonly ctx = inject(OrderContractContextService)

  ngOnInit(): void {
    this.ctx.load(+this.route.snapshot.params['id']);
  }
}
