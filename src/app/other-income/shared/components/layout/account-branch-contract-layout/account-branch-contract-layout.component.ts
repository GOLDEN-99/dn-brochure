import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { BranchContractContextService } from '../../../../purchase/services/branch-contract-context.service';

@Component({
  selector: 'app-account-branch-contract-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe],
  templateUrl: './account-branch-contract-layout.component.html',
  styleUrl: './account-branch-contract-layout.component.scss',
})
export class AccountBranchContractLayoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly location = inject(Location)
  readonly ctx = inject(BranchContractContextService)

  ngOnInit(): void {
    this.ctx.load(+this.route.snapshot.params['id']);
  }

  goBack(): void {
    this.location.back();
  }
}
