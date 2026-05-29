import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { TCnType, TPrependRemark, TReamrk } from '../../../types/cn.type';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CnRemarkService {


  private readonly api = inject(ApiService)

  private readonly base = environment.cnPath

  private readonly remark$ = this.api.get<TReamrk[]>(`${this.base}/GetCNRemark`)
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

  probOption = computed(() => this.handleRemark(this.remarkOpt().id))
  showProbOption = computed(() => this.probOption().length !== 0)
  showCn = computed(() => this.handleShowCn(this.remarkOpt().id))
  remarkOpt = signal<TReamrk>({ id: "0", remark: "กรุณาเลือกสาเหตุ" })
  invalidRemarkOpt = computed(() => {
    const { id, remark } = this.remarkOpt();
    return id === '0' || remark === "กรุณาเลือกสาเหตุ"
  })
  prob = signal<TResult>({ id: '-1', result: "กรุณาเลือก" })
  invalidProb = computed(() => {
    const { id, result } = this.prob()
    return id === '-1' || result === "กรุณาเลือก"
  })
  cnType = signal<TCnType>(null)


  setRemarkOption = ({ id, remark }: TReamrk) => {
    this.remarkOpt.set({ id, remark })
    // do side effect
    if (id === '0') return
    this.prob.set({ id: '-1', result: 'กรุณาเลือก' })
    this.cnType.update(() => null)
  }
  setProb = (value: TResult) => this.prob.set(value)
  setCnType = (value: TCnType) => this.cnType.set(value)

  prependReq = computed(() => {
    const { id } = this.prob()
    const probOption = id === '-1' ? null : id
    const { id: motiveId, remark: motive } = this.remarkOpt()
    return { motiveId, motive, probOption } satisfies TPrependRemark
  })

  private readonly handleRemark = (id: string): TResult[] => {
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

  private readonly handleShowCn = (id: string) => {
    switch (id) {
      case '0': return false
      case '19': return false
      case '30': return false
      case '31': return false
      default: return true
    }
  }
  private readonly default: TReamrk[] = [{ id: "0", remark: "กรุณาเลือกสาเหตุ" }]

  calDisable() {
    const showProb = this.showProbOption()
    const invalidProb = this.invalidProb()
    const showCn = this.showCn()
    const invalidRemark = this.invalidRemarkOpt()
    const cnType = this.cnType()
    return invalidRemark || (invalidProb && showProb) || (cnType === null && showCn)
  }
}
type TResult = {
  id: string,
  result: string
}