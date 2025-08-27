import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor() { }

  private api = inject(ApiService)
  private url = environment.oi
  private event$ = this.api.get<TEvent[]>(`${this.url}/other-income/event`).pipe(catchError(err => { console.log(err); return of([]) }))
  event = toSignal(this.event$, { initialValue: [] })
}


export type TEvent = {
  id: number
  eventName: string
  isLight: number
}