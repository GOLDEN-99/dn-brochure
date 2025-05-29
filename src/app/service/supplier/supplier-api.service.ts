import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { TGeneratedCompCode } from '../../types/ibob-supplier.type';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class SupplierApiService {

  constructor() { }

  private api = inject(ApiService)
  private url = environment.ibob

  private generatedCode$ = this.api.get<TGeneratedCompCode>(`${this.url}/GetCompInfoCreate`)

  generatedCode = toSignal(this.generatedCode$, { initialValue: null })

  createSupplier = (req: TCreateSupplierReq) => this.api.post(`${this.url}/CreateCompInfo`, req, {})
}

export type TCreateSupplierReq = {}
