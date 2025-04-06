import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { catchError, map, Subject, switchMap, tap, throwError } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { TAppGoodItem, TAppLot, TGoodItem, TLotItem, TOrderRes } from '../../../types/cn.type';
import { TMaybe } from '../../../types';

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
  selectItem = computed(() => this.itemList().filter(({ check }) => check))
  handleSelect = (id: number, check: boolean) => {
    this.itemList.update(prev => prev.map((i, idx) => idx === id ? ({ ...i, check }) : i))
  }

  addedItem = signal<TAppGoodItem[]>([])
  selectAddedItem = computed(() => this.addedItem().filter(({ check }) => check))
  handleSelectAdded = (id: number, check: boolean) => {
    this.addedItem.update(prev => prev.map((i, idx) => idx === id ? ({ ...i, check }) : i))
  }

  totalItem = computed(() => [...this.itemList(), ...this.addedItem()])
  totalSelected = computed(() => this.totalItem().filter(({ check }) => check))
  totalCnt = computed(() => this.totalSelected().length)
  selectedLot = computed(() => this.totalSelected().flatMap(
    ({ subTotal, unitPrice, unitCode, lot }) => lot.flatMap(
      ({ check, lotNumber, goodAmou, goodCode, expiDate }) => check
        ? [{ lotNumber, goodAmou, goodCode, expiDate, unitPrice, unitCode, subTotal }]
        : []
    )
  ))

  handleCheckLot = this.baseCheckLot(this.itemList)

  handleCheckLotAdded = this.baseCheckLot(this.addedItem)

  private baseCheckLot(sig: WritableSignal<TAppGoodItem[]>) {
    return ({ goodCode: curGoodCode, ...ref }: TCurrentRef) => {
      const isSameLot = this.checkLot(ref)
      return (incoming: TEditableField) => {
        sig.update(
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
    }
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

interface TCurrentRef {
  lotNumber: TMaybe<string>
  expiDate: string //iso
  goodCode: string
}

