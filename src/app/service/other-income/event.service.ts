import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor() { }

  private readonly api = inject(ApiService)
  private readonly url = environment.oi
  private readonly event$ = this.api.get<TEvent[]>(`${this.url}/other-income/event`).pipe(catchError(err => { console.log(err); return of([]) }))
  event = toSignal(this.event$, { initialValue: [] })
}


export type TEvent = {
  id: number
  eventName: string
  eventType: number
}