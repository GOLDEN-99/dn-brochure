import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { OrderContractContextService } from '../../../../purchase/services/order-contract-context.service';
import { ToastService } from '../../../../../service/toast/toast.service';

@Component({
  selector: 'app-order-contract-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe],
  templateUrl: './order-contract-layout.component.html',
  styles: '',
})
export class OrderContractLayoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly location = inject(Location)
  private readonly toast = inject(ToastService)
  readonly ctx = inject(OrderContractContextService)

  ngOnInit(): void {
    this.ctx.load(+this.route.snapshot.params['id']);
  }

  goBack(): void {
    this.location.back();
  }

  onDeleteContract(): void {
    this.ctx.deleteContract().subscribe({
      next: () => {
        this.toast.success('ลบสัญญาเรียบร้อย')
        this.router.navigate(['../'], { relativeTo: this.route })
      },
      error: (err) => this.toast.danger(err?.error?.error ?? 'เกิดข้อผิดพลาด'),
    })
  }
}
