import { Component, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { BranchContractContextService } from '../../../../purchase/services/branch-contract-context.service';

@Component({
  selector: 'app-account-branch-contract-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe],
  templateUrl: './account-branch-contract-layout.component.html',
  styleUrl: './account-branch-contract-layout.component.scss',
})
export class AccountBranchContractLayoutComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly location = inject(Location)
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
}
