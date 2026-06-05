import { Component, inject } from '@angular/core';
import { CnStateService } from '../../shared/services/cn-state.service';

@Component({
  selector: 'app-cn-fail',
  imports: [],
  templateUrl: './cn-fail.component.html',
  styleUrl: './cn-fail.component.scss',
})
export class CnFailComponent {
  private readonly state = inject(CnStateService)
  readonly error = this.state.loadError
}
