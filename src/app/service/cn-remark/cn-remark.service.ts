import { computed, inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { TReamrk } from '../../types/cn.type';

@Injectable({
  providedIn: 'root'
})
export class CnRemarkService {

  constructor() { }

  private api = inject(ApiService)

  private base = "https://sandbox.dn.drugnetcenter.com/ReturnRequest"

  private remark$ = this.api.get<TReamrk[]>(`${this.base}/GetCNRemark`)
    .pipe(
      catchError(err => {
        console.log(err);
        return of([] satisfies TReamrk[])
      })
    )

  remarkSignal = toSignal<TReamrk[]>(this.remark$)
  withFallback = computed(() => {
    const r = this.remarkSignal()
    return r ? [...this.default, ...r] : this.default
  })
  handleRemark = (id: string) => {
    switch (id) {
      case '3': return [{ label: 'ลูกค้าไม่รับ', value: '0' }, { label: 'ลูกค้ารับ', value: '1' }]
      case '4': return [{ label: 'ลูกค้าไม่รับ', value: '0' }, { label: 'ลูกค้ารับ', value: '1' }]
      case '5': return [{ label: 'ลูกค้าไม่รับ', value: '0' }, { label: 'ลูกค้ารับ', value: '1' }, { label: 'ลูกค้ารับเปลี่ยน', value: '2' }]
      case '12': return [{ label: 'ลูกค้าไม่รับ', value: '0' }, { label: 'ลูกค้ารับเปลี่ยน', value: '2' }]
      case '19': return []
      case '30': return []
      case '31': return []
      default: return []
    }
  }
  private default: TReamrk[] = [{ id: "0", remark: "กรุณาเลือก" }]
}
