import { Component, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { NgbAlert, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../service/toast/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgbAlertModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  private _message$ = new Subject<string>();

  severity = 'success';
  successMessage = '';

  @ViewChild('selfClosingAlert', { static: false }) selfClosingAlert!: NgbAlert;

  constructor(private _toastService: ToastService) {

    this._toastService.message$
      .pipe(
        takeUntilDestroyed(),
        tap(({ message, severity }) => { this.successMessage = message; this.severity = severity }),
        debounceTime(5000),
      )
      .subscribe(() => this.selfClosingAlert?.close());
  }

  public changeSuccessMessage() {
    this._message$.next(`${new Date()} - Message successfully changed.`);
  }
}
