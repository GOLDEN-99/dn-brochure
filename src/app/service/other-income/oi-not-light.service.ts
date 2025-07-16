import { inject, Injectable, signal } from '@angular/core';
import { TInsertMonthlyIncome, TOIStepItem } from '../../types';
import { BaseOiService } from './base-oi';
import { environment } from '../../../environments/environment';
import { TEvent } from './event.service';
import { TOIComp } from './company.service';
import { TDiscount } from './discount.service';
import { TIncome } from './income.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, filter, map, of, Subject, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OiNotLightService extends BaseOiService {
  mock: NotLightSingle[] = [
    {
      "stepList": [
        {
          // "id": 1,
          "min": 0,
          "max": 10000,
          "rate": 1
        },
        {
          // "id": 2,
          "min": 10000,
          "max": 50000,
          "rate": 2
        },
        {
          // "id": 3,
          "min": 50000,
          "max": null,
          "rate": 3
        }
      ],
      "productList": [
        {
          "id": 1,
          "goodCode": "10077",
          "goodName": "ฟ้าทะลายโจรสารสกัด 20mg<ขาวละออ>1x30แคป"
        },
        {
          "id": 2,
          "goodCode": "10161",
          "goodName": "เพชรสังฆาต <ขาวละออ> 1x100เม็ด"
        },
        {
          "id": 3,
          "goodCode": "10162",
          "goodName": "มะขามแขก<ขาวละออ> 1x100เม็ด"
        },
        {
          "id": 4,
          "goodCode": "10163",
          "goodName": "Colla 500mg<ขาวละออ>1x60tab"
        },
        {
          "id": 5,
          "goodCode": "10251",
          "goodName": "กระชายพลัสขาว<ขาวละออ>1x60แคป"
        },
        {
          "id": 6,
          "goodCode": "10353",
          "goodName": "ตรีผลาแคปซูล<ขาวละออ> 1x100แคป"
        },
        {
          "id": 7,
          "goodCode": "10451",
          "goodName": "ขิงผงชง Sugar Free<ขาวละออ>1x10x5.93กรัม"
        },
        {
          "id": 8,
          "goodCode": "11355",
          "goodName": "เค-เซนล่า ใบบัวบกสกัด <ขาวละออ> 1x60แคป"
        },
        {
          "id": 9,
          "goodCode": "11356",
          "goodName": "ยาแก้ไข้ชนิดเม็ด ตราดอกว่าน<ขาวละออ>1x60เม็ด"
        },
        {
          "id": 10,
          "goodCode": "11357",
          "goodName": "ยาห้ารากสกัดชนิดเม็ด<ขาวละออ>1x60เม็ด"
        },
        {
          "id": 11,
          "goodCode": "11421",
          "goodName": "Alicia 5000 Garlic<ขาวละออ> 1x30tab"
        },
        {
          "id": 12,
          "goodCode": "11422",
          "goodName": "Alicia 5000 Garlic<ขาวละออ> 1x60tab"
        },
        {
          "id": 13,
          "goodCode": "11838",
          "goodName": "ยาธรณีสันฑะฆาต<ขาวละออ>1x60แคป"
        },
        {
          "id": 14,
          "goodCode": "12387",
          "goodName": "K Samin เมล็ดงาดำ <ขาวละออ> 1x60แคป"
        },
        {
          "id": 15,
          "goodCode": "12388",
          "goodName": "ยาขิงแคปซูล <ขาวละออ> 10Cap"
        },
        {
          "id": 16,
          "goodCode": "1295",
          "goodName": "Immuny Top 2000 Garlic<ขาวละออ> 1x100tab"
        },
        {
          "id": 17,
          "goodCode": "13063",
          "goodName": "เค-เซนล่า ใบบัวบกสกัด <ขาวละออ> 1x2x10เม็ด"
        },
        {
          "id": 18,
          "goodCode": "3531",
          "goodName": "กวาดลิ้นขาวละออ(ซอง)"
        },
        {
          "id": 19,
          "goodCode": "4935",
          "goodName": "มะรุม<ขาวละออ> 1x200แคป"
        },
        {
          "id": 20,
          "goodCode": "7697",
          "goodName": "ยาขมิ้นชัน<ขาวละออ> 1x100แคป"
        },
        {
          "id": 21,
          "goodCode": "7698",
          "goodName": "ยาแคปซูลกระชายดำ<ขาวละออ> 1x100แคป"
        },
        {
          "id": 22,
          "goodCode": "7734",
          "goodName": "หอมเทพจิต หลอด<ขาวละออ>1x15เม็ด"
        },
        {
          "id": 23,
          "goodCode": "7801",
          "goodName": "ยากวาวเครือขาว<ขาวละออ> 1x60แคป"
        },
        {
          "id": 24,
          "goodCode": "7955",
          "goodName": "ลูกใต้ใบ<ขาวละออ> 1x100แคป"
        },
        {
          "id": 25,
          "goodCode": "8345",
          "goodName": "ฟ้าทะลายโจรสกัด 9mg<ขาวละออ> 1x50แคป"
        },
        {
          "id": 26,
          "goodCode": "8346",
          "goodName": "ยาเม็ดรางจืด<ขาวละออ> 1x100แคป"
        },
        {
          "id": 27,
          "goodCode": "8587",
          "goodName": "มะระขี้นกชนิดเม็ด<ขาวละออ> 1x100เม็ด"
        },
        {
          "id": 28,
          "goodCode": "9152",
          "goodName": "เห็ดหลินจือสกัด 250มก.<ขาวละออ> 1x60แคป"
        },
        {
          "id": 29,
          "goodCode": "9263",
          "goodName": "ยาทารักษาแผลในปาก (ขาวละออ)"
        }
      ],
      "event": {
        "id": 1,
        "isLight": false,
        "eventName": "DC"
      },
      "income": {
        "id": 1,
        "incomeName": "ท้ายบิล",
        "isProduct": true
      },
      "discount": {
        "id": 1,
        "discountName": "ไม่ลด"
      },
      "company": {
        "compType": "DN",
        "compCode": "182",
        "compName": "2B Marketing Co.,Ltd.",
        // "compName2": "ทูบี มาร์เก็ตติ้ง จํากัด",
        // "compGroupCode": "1"
      },
      "id": 6,
      "notLightId": 10,
      "displayName": "",
      "period": 1,
      "startDate": "2025-07-09T00:00:00",
      "endDate": "2026-07-31T00:00:00",
      "isStep": true,
      "capAmount": null,
      "incVat": false,
      "cn": "test cn"
    }
  ]

  private url = environment.oi

  getAll(query: {}) {
    return this.api.get<NotLightSummary[]>(`${this.url}/other-income/contact/not-light`, { params: query })
      .pipe(catchError(err => of([])))
  }

  private term$ = new Subject<string>()
  private mode$ = new Subject<number>()
  private queryParam = combineLatest([this.mode$, this.term$]).pipe(filter(([mode, term]) => mode !== 0 && !!term))

  private notLight$ = this.queryParam.pipe(
    switchMap(([mode, term]) => this.getAll({ mode, term }))
  )
  searchMany(mode: number, term: string) {
    this.term$.next(term)
    this.mode$.next(mode)
  }

  notLightList = toSignal(this.notLight$, { initialValue: [] })

  getById(id: number) {
    return this.api.get<NotLightSingle[]>(`${this.url}/other-income/contact/not-light/${id}`)
      .pipe(catchError(err => {
        console.log(err);
        return of(this.mock);
      }
      ))
    return of(this.mock)
  }

  private fetch$ = new BehaviorSubject<boolean>(true)
  private id$ = new Subject<number>()
  private param$ = combineLatest([this.fetch$, this.id$])
  fetchById(id: number) {
    this.id$.next(id)
  }

  private singleRecord$ = this.param$
    .pipe(
      switchMap(([_, id]) => this.getById(id)),
    )
  singleRecord = toSignal(this.singleRecord$, { initialValue: [] })
  create(req: {}) {
    return this.api.post(this.url, req)
  }

  update(id: number, body: {}) {
    return this.api.post(`${this.url}/${id}`, body)
  }

  addIncome(id: number, req: TInsertMonthlyIncome) {
    return this.api.post(`${this.url}/${id}/incomes`, req)
  }

  getTerm(id: number) {
    return this.api.get(`${this.url}/${id}/terms`)
  }

  createPo(id: number, purchasingId: number, poList: {}) {
    return this.api.post(`${this.url}/${id}/${purchasingId}`, poList)
  }

}

type NotLightSummary = {
  id: number
  notLightId: number,
  displayName: string,
  period: number,
  startDate: string,
  endDate: string,
  isStep: boolean,
  capAmount: number | null,
  incVat: boolean,
  cn: string,
  company: TOIComp
  event: TEvent,
  discount: TDiscount
  income: TIncome
}

type NotLightSingle = {
  stepList: TOIStepItem[]
  productList: { id: number, goodCode: string, goodName: string }[]
} & NotLightSummary


type TProductItem = {
  id: number
  goodCode: string
  goodName: string
}

type TStepRes = {
  id: number
  min: number
  max: number | null
  rate: number
}