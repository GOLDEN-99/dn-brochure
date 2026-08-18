import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import { catchError, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TSupplierPair } from '../../shared/types/other-income.type';

@Injectable({
  providedIn: 'root',
})
export class OtherIncomeSupplierPairService {
  private readonly api = inject(ApiService)
  private readonly url = `${environment.oi}/v2/master/supplier-pairs`

  private readonly supplierPairList$ = this.getAll().pipe(
    catchError(() => of([] satisfies TSupplierPair[]))
  )

  supplierPairList = toSignal(this.supplierPairList$, { initialValue: [] })

  getAll() {
    return this.api.get<TSupplierPair[]>(this.url)
  }
}
