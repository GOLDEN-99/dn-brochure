import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  constructor() { }

  loading = signal(false)

  startLoad() {
    this.loading.update(() => true)
  }

  endLoad() {
    this.loading.update(() => false)
  }
}
