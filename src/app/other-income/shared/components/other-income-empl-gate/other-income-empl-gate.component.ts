import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OtherIncomeEmplAuthService } from '../../services/other-income-empl-auth.service';

@Component({
  selector: 'other-income-empl-gate',
  imports: [RouterOutlet],
  templateUrl: './other-income-empl-gate.component.html',
  styleUrl: './other-income-empl-gate.component.scss',
})
export class OtherIncomeEmplGateComponent {
  private readonly auth = inject(OtherIncomeEmplAuthService)

  checked = this.auth.checked
  employee = this.auth.employee
}
