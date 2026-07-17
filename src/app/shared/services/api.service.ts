import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TApiOpt } from '../types/index.type';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private readonly https = inject(HttpClient)

  createJWTHeader = (jwt: string) => ({ headers: { Authorization: `bearer ${jwt}` } })

  get<T>(path: string, opt: TApiOpt = {}) {
    return this.https.get<T>(path, opt).pipe(catchError(err => throwError(() => err)))
  }
  post<T>(path: string, body: any, opt: TApiOpt = {}) {
    return this.https.post<T>(path, body, opt).pipe(catchError(err => throwError(() => err)))
  }
  delete<T = any>(path: string, opt: TApiOpt = {}) {
    return this.https.delete<T>(path, opt).pipe(catchError(err => throwError(() => err)))
  }
  put<T = unknown>(path: string, body: any, opt: TApiOpt = {}) {
    return this.https.put<T>(path, body, opt).pipe(catchError(err => throwError(() => err)))
  }
  patch<T>(path: string, body: {}, opt: TApiOpt = {}) {
    return this.https.patch<T>(path, body, opt).pipe(catchError(err => throwError(() => err)))
  }
}
