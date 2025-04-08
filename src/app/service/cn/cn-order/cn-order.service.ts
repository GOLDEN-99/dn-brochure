import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { catchError, map, Subject, switchMap, tap, throwError } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { TAppGoodItem, TGoodItem, TOrderRes, TPrependOrder } from '../../../types/cn.type';
import { TMaybe } from '../../../types';
import { baseCheckLot } from './lib';

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
  selectedLotItem = computed(
    () => this.totalSelected().flatMap(
      ({ unitCode, unitPrice, lot, goodCode, goodName }) =>
        lot.flatMap(
          ({ check, returnAmou, lotNumber, expiDate }) =>
            check
              ? [{
                goodcode: goodCode,
                unitcode: unitCode,
                unitprice: unitPrice,
                lotNumber,
                goodAmou: returnAmou,
                expiDate,
                subtotal: unitPrice * returnAmou,
                goodName
              }]
              : []
        )
    )
  )
  selectedSubtotal = computed(() => this.totalSelected().reduce(
    (sum, { lot, unitPrice }) =>
      sum + lot.reduce((acc, { returnAmou }) => acc + (unitPrice * returnAmou), 0
      ), 0))
  prependSome = computed(() => {
    const totalprice = this.selectedSubtotal()
    const goodList = this.selectedLotItem()
    return { totalprice, goodList } satisfies TPrependOrder
  })


  wholeBillItem = computed(() =>
    this.itemList().flatMap(({ unitCode, unitPrice, lot, goodCode, subTotal, goodName }) =>
      lot.map(({ goodAmou, lotNumber, expiDate }) =>
      ({
        goodcode: goodCode,
        unitcode: unitCode,
        unitprice: unitPrice,
        lotNumber,
        goodAmou,
        expiDate,
        subtotal: subTotal,
        goodName
      })
      )
    )
  )
  wholeBillSubtotal = computed(() => this.itemList().reduce((sum, { subTotal }) => sum + subTotal, 0))
  prependWhole = computed(() => {
    const totalprice = this.wholeBillSubtotal()
    const goodList = this.wholeBillItem()
    return { totalprice, goodList } satisfies TPrependOrder
  })

  rawPrice = signal(0)

  handleCheckLot = baseCheckLot(this.itemList)
  handleCheckLotAdded = baseCheckLot(this.addedItem)

  private setOrderHead = ({ goodList, ...res }: TOrderRes) =>
    this.orderHead.update(prev => prev === null ? res : ({ ...prev, ...res }))

  private mapCheck = ({ lot, ...res }: TGoodItem): TAppGoodItem =>
    ({ ...res, check: false, lot: lot.map(l => ({ ...l, check: false, returnAmou: 0 })) })
}

type TPrependItem = {
  lotNumber: string;
  goodAmou: string;
  goodCode: string;
  expiDate: string;
  unitPrice: number;
  unitCode: string;
  subTotal: number
}


interface TCurrentRef {
  lotNumber: TMaybe<string>
  expiDate: string //iso
  goodCode: string
}

