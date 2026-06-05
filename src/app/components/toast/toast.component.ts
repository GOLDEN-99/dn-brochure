import { Component, OnDestroy } from '@angular/core';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService, TToastProps } from '../../service/toast/toast.service';

interface ToastItem extends TToastProps {
  id: number
}

@Component({
  selector: 'app-toast',
  imports: [NgbAlertModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent implements OnDestroy {
  toasts: ToastItem[] = [];

  private _nextId = 0;
  private readonly _timers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor(private readonly _toastService: ToastService) {
    this._toastService.message$
      .pipe(takeUntilDestroyed())
      .subscribe(({ message, severity }) => this._add(message, severity));
  }

  private _add(message: string, severity: TToastProps['severity']) {
    const id = this._nextId++;
    this.toasts.push({ id, message, severity });
    const timer = setTimeout(() => this.remove(id), 5000);
    this._timers.set(id, timer);
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    const timer = this._timers.get(id);
    if (timer) { clearTimeout(timer); this._timers.delete(id); }
  }

  ngOnDestroy() {
    this._timers.forEach(t => clearTimeout(t));
  }
}
