import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TApiOpt } from '../types/index.type';
import { catchAndRethrow } from '../libs/rxjs-custom-operator';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  
  private readonly https = inject(HttpClient)

  createJWTHeader = (jwt: string) => ({ headers: { Authorization: `bearer ${jwt}` } })

  get<T>(path: string, opt: TApiOpt = {}) {
    return this.https.get<T>(path, opt).pipe(catchAndRethrow())
  }
  post<T>(path: string, body: any, opt: TApiOpt = {}) {
    return this.https.post<T>(path, body, opt).pipe(catchAndRethrow())
  }
  delete<T = any>(path: string, opt: TApiOpt = {}) {
    return this.https.delete<T>(path, opt).pipe(catchAndRethrow())
  }
  put<T = unknown>(path: string, body: any, opt: TApiOpt = {}) {
    return this.https.put<T>(path, body, opt).pipe(catchAndRethrow())
  }
  patch<T>(path: string, body: {}, opt: TApiOpt = {}) {
    return this.https.patch<T>(path, body, opt).pipe(catchAndRethrow())
  }
}
