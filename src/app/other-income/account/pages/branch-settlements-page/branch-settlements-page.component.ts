import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BranchContractContextService } from '../../../purchase/services/branch-contract-context.service';

@Component({
  selector: 'app-branch-settlements-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './branch-settlements-page.component.html',
  styleUrl: './branch-settlements-page.component.scss',
})
export class BranchSettlementsPageComponent {
  readonly ctx = inject(BranchContractContextService)
}
