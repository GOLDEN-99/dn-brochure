import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  message$ = new Subject<TToastProps>()

  success(message: string) {
    this.message$.next({ message, severity: 'success' })
  }

  danger(message: string) {
    this.message$.next({ message, severity: 'danger' })
  }
}

export type TToastSeverity = 'success' | 'danger'

export type TToastProps = {
  message: string
  severity: TToastSeverity
}
