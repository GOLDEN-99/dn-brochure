import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { environment } from '../../../../environments/environment';
import {
  TBookedCheckInReq,
  TCompType,
  TReceivingBoard,
  TReceivingConfig,
  TSupplierHit,
  TVisit,
  TWalkInCheckInReq,
} from '../../shared/types/receiving.type';

/** other-income-api `/inbound-outbound`: the warehouse side (check-in, queue, gates). */
@Injectable({ providedIn: 'root' })
export class ReceivingApiService {
  private readonly api = inject(ApiService)
  private readonly url = `${environment.oi}/inbound-outbound`
  private readonly supplierUrl = `${environment.oi}/v2/master/suppliers`

  getConfig(warehouseCode: string): Observable<TReceivingConfig> {
    return this.api.get<TReceivingConfig>(`${this.url}/config`, { params: { warehouseCode } })
  }

  /** Today's board; the API decides what "today" is. */
  getBoard(warehouseCode: string): Observable<TReceivingBoard> {
    return this.api.get<TReceivingBoard>(`${this.url}/visits/board`, { params: { warehouseCode } })
  }

  checkInWalkIn(req: TWalkInCheckInReq): Observable<TVisit> {
    return this.api.post<TVisit>(`${this.url}/visits/check-in`, req)
  }

  checkInBooked(id: number, req: TBookedCheckInReq): Observable<TVisit> {
    return this.api.post<TVisit>(`${this.url}/visits/${id}/check-in`, req)
  }

  assignGate(id: number, gateId: number, force: boolean): Observable<TVisit> {
    return this.api.post<TVisit>(`${this.url}/visits/${id}/assign-gate`, { gateId, force })
  }

  finish(id: number): Observable<TVisit> {
    return this.api.post<TVisit>(`${this.url}/visits/${id}/finish`, {})
  }

  cancel(id: number, reason: string | null): Observable<TVisit> {
    return this.api.post<TVisit>(`${this.url}/visits/${id}/cancel`, { reason })
  }

  /** Suppliers of both companies by name. A failed lookup is an empty list: the name can still be typed. */
  searchSuppliers(compName: string, limit = 6): Observable<TSupplierHit[]> {
    const one = (compType: TCompType) =>
      this.api.get<{ compCode: string, compName: string }[]>(this.supplierUrl, { params: { compType, compName } }).pipe(
        map(rows => rows.slice(0, limit).map(r => ({ compCode: r.compCode, compName: r.compName, compType }))),
        catchError(() => of([] as TSupplierHit[])),
      )
    return forkJoin([one('DN'), one('HU')]).pipe(map(([dn, hu]) => [...dn, ...hu]))
  }
}
