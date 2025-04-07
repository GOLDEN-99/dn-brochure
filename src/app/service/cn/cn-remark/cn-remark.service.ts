import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { TCnType, TPrependRemark, TReamrk } from '../../../types/cn.type';

@Injectable({
  providedIn: 'root'
})
export class CnRemarkService {

  constructor() {
    const eff = effect(() => {
      this.remarkOpt()
      this.result.set({ id: '-1', result: 'กรุณาเลือก' })
      this.cnType.update(() => null)
    })
  }

  private api = inject(ApiService)

  private base = "https://sandbox.dn.drugnetcenter.com/ReturnRequest"

  private remark$ = this.api.get<TReamrk[]>(`${this.base}/GetCNRemark`)
    .pipe(
      catchError(err => {
        console.log(err);
        return of([] satisfies TReamrk[])
      })
    )

  private remarkSignal = toSignal<TReamrk[]>(this.remark$)
  withFallback = computed(() => {
    const r = this.remarkSignal()
    return r ? [...this.default, ...r] : this.default
  })

  resultOptionList = computed(() => this.handleRemark(this.remarkOpt().id))
  showResult = computed(() => this.resultOptionList().length !== 0)

  remarkOpt = signal<TReamrk>({ id: "0", remark: "กรุณาเลือก" })
  invalidRemarkOpt = computed(() => this.remarkOpt().id === '0')
  result = signal<TResult>({ id: '-1', result: "กรุณาเลือก" })
  cnType = signal<TCnType>(null)


  setRemarkOption = (value: TReamrk) => this.remarkOpt.set(value)
  setResult = (value: TResult) => this.result.set(value)
  setCnType = (value: TCnType) => this.cnType.set(value)

  prependReq = computed(() => {
    const { id } = this.result()
    const probOption = id === '-1' ? null : id
    const { id: motiveId, remark: motive } = this.remarkOpt()
    return { motiveId, motive, probOption } satisfies TPrependRemark
  })

  private handleRemark = (id: string): TResult[] => {
    switch (id) {
      case '3': return [{ id: '-1', result: 'กรุณาเลือก' }, { result: 'ลูกค้าไม่รับ', id: '0' }, { result: 'ลูกค้ารับ', id: '1' }]
      case '4': return [{ id: '-1', result: 'กรุณาเลือก' }, { result: 'ลูกค้าไม่รับ', id: '0' }, { result: 'ลูกค้ารับ', id: '1' }]
      case '5': return [{ id: '-1', result: 'กรุณาเลือก' }, { result: 'ลูกค้าไม่รับ', id: '0' }, { result: 'ลูกค้ารับ', id: '1' }, { result: 'ลูกค้ารับเปลี่ยน', id: '2' }]
      case '12': return [{ id: '-1', result: 'กรุณาเลือก' }, { result: 'ลูกค้าไม่รับ', id: '0' }, { result: 'ลูกค้ารับเปลี่ยน', id: '2' }]
      case '19': return []
      case '30': return []
      case '31': return []
      default: return []
    }
  }
  private default: TReamrk[] = [{ id: "0", remark: "กรุณาเลือก" }]

  calDisable() {
    if (this.invalidRemarkOpt()) return true
    if (!this.showResult()) return false
    return this.cnType() === null || this.result().id === '-1'
  }
}
type TResult = {
  id: string,
  result: string
}