import { Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { BranchContractContextService } from '../../../../purchase/services/branch-contract-context.service';
import { ToastService } from '../../../../../service/toast/toast.service';

@Component({
  selector: 'app-branch-contract-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe],
  templateUrl: './branch-contract-layout.component.html',
  styles: '',
})
export class BranchContractLayoutComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly location = inject(Location)
  private readonly toast = inject(ToastService)
  readonly ctx = inject(BranchContractContextService)

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
