import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TObj } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }
  private https = inject(HttpClient)

  get<T>(path: string, opt: TObj = {}) {
    return this.https.get<T>(path, opt)
  }
}
