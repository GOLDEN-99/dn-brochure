import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TObj } from '../../types';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }
  private https = inject(HttpClient)

  get<T>(path: string, opt: TObj = {}) {
    return this.https.get<T>(path, opt).pipe(catchError(err => throwError(() => err)))
  }
  post<T>(path: string, body: any, opt: TObj = {}) {
    return this.https.post<T>(path, body, opt).pipe(catchError(err => throwError(() => err)))
  }
}
