import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { BranchContractContextService } from '../../../../purchase/services/branch-contract-context.service';
import { ToastService } from '../../../../../service/toast/toast.service';

@Component({
  selector: 'app-branch-contract-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe],
  templateUrl: './branch-contract-layout.component.html',
  styles: '',
})
export class BranchContractLayoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly location = inject(Location)
  private readonly toast = inject(ToastService)
  readonly ctx = inject(BranchContractContextService)

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
