import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BranchContractContextService } from '../../../services/branch-contract-context.service';

@Component({
  selector: 'app-branch-contract-accruals-page',
  imports: [DatePipe],
  templateUrl: './branch-contract-accruals-page.component.html',
  styleUrl: './branch-contract-accruals-page.component.scss',
})
export class BranchContractAccrualsPageComponent {
  readonly ctx = inject(BranchContractContextService)
}
