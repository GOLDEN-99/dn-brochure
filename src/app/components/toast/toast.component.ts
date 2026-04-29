import { Component, ViewChild } from '@angular/core';
import { debounceTime, tap } from 'rxjs/operators';
import { NgbAlert, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../service/toast/toast.service';

@Component({
  selector: 'app-toast',
  imports: [NgbAlertModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  severity = 'success';
  successMessage = '';

  @ViewChild('selfClosingAlert', { static: false }) selfClosingAlert!: NgbAlert;

  constructor(private readonly _toastService: ToastService) {

    this._toastService.message$
      .pipe(
        takeUntilDestroyed(),
        tap(({ message, severity }) => { this.successMessage = message; this.severity = severity }),
        debounceTime(5000),
      )
      .subscribe(() => this.selfClosingAlert?.close());
  }
}
