import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { catchError, map, Subject, switchMap, tap, throwError } from 'rxjs';
import { TAppGoodItem, TAppLot, TGoodItem, TLotItem, TOrderRes } from '../../types/cn.type';
import { TMaybe } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class CnOrderService {

  constructor() {
    this.wholeNumb$.pipe(switchMap(this.getOrder)).subscribe({
      next: (lst) => this.itemList.update(() => lst),
      error: (err) => { console.log(err); this.itemList.update(() => []) }
    })
  }

  private api = inject(ApiService)
  private url = "https://sandbox.dn.drugnetcenter.com/ReturnRequest"
  private getOrder = (wholeNumb: string) =>
    this.api.get<TOrderRes>(`${this.url}/GetOrder`, { params: { WholeNumb: wholeNumb } })
      .pipe(
        tap(this.setOrderHead),
        map(({ goodList }) => goodList.map(this.mapCheck)),
        catchError((err) => throwError(() => err))
      )
  private wholeNumb$ = new Subject<string>()

  fetch = (wholeNumber: string) => this.wholeNumb$.next(wholeNumber)

  orderHead = signal<TMaybe<Omit<TOrderRes, 'goodList'>>>(null)

  itemList = signal<TAppGoodItem[]>([])
  selected = computed(() => this.itemList().filter(({ check }) => check))
  selectedLot = computed(() => this.selected().flatMap(
    ({ subTotal, unitPrice, unitCode, lot }) => lot.flatMap(
      ({ check, lotNumber, goodAmou, goodCode, expiDate }) => check
        ? [{ lotNumber, goodAmou, goodCode, expiDate, unitPrice, unitCode, subTotal }]
        : []
    )
  ))

  handleSelect = (id: number, check: boolean) => {
    this.itemList.update(prev => prev.map((i, idx) => idx === id ? ({ ...i, check }) : i))
  }

  handleCheckLot = (curGoodCode: string, ref: TEditField) => (incoming: TEditableField) => {
    const isSameLot = this.checkLot(ref)
    this.itemList.update(
      prev => prev.map(
        (good) => good.goodCode !== curGoodCode
          ? good
          : ({
            ...good,
            lot: good.lot
              .map(
                ({ lotNumber, expiDate, goodAmou, check, goodCode }) =>
                  isSameLot({ lotNumber, expiDate })
                    ? { lotNumber, expiDate, goodAmou, check, goodCode, ...incoming }
                    : { lotNumber, expiDate, goodAmou, check, goodCode }
              )
          })
      )
    )
  }

  private setOrderHead = ({ goodList, ...res }: TOrderRes) =>
    this.orderHead.update(prev => prev === null ? res : ({ ...prev, ...res }))

  private mapCheck = ({ lot, ...res }: TGoodItem): TAppGoodItem =>
    ({ ...res, check: false, lot: lot.map(l => ({ ...l, check: false })) })

  private checkLot = ({ lotNumber, expiDate }: TEditField) => {
    if (!lotNumber) {
      return ({ expiDate: cur }: TEditField) => cur === expiDate
    }
    return ({ lotNumber: cur }: TEditField) => cur === lotNumber
  }
}

type TEditField = Pick<TLotItem, 'lotNumber' | 'expiDate'>

type TEditableField = Partial<Pick<TAppLot, 'goodAmou' | 'check'>>

