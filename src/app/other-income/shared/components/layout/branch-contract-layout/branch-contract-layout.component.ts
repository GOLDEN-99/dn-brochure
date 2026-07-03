import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BranchContractContextService } from '../../../../purchase/services/branch-contract-context.service';

@Component({
  selector: 'app-branch-contract-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe],
  templateUrl: './branch-contract-layout.component.html',
  styles: '',
})
export class BranchContractLayoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  readonly ctx = inject(BranchContractContextService)

  ngOnInit(): void {
    this.ctx.load(+this.route.snapshot.params['id']);
  }
}
