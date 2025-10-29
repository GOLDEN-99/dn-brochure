import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';
import { StockItemApiService, TQueryNewStockResponse } from '../../../service/stock-item/stock-item-api.service';
import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { TMaybe } from '../../../types';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../../service/toast/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { toXlxs } from '../../../lib/utli';

@Component({
  selector: 'app-stock-item-report',
  imports: [FormsModule, NgTemplateOutlet, DatePipe],
  templateUrl: './stock-item-report.component.html',
  styleUrl: './stock-item-report.component.scss'
})
export class StockItemReportComponent {
  private stockItemService = inject(StockItemApiService)
  private refetch$ = new BehaviorSubject(true);
  touch = signal(false);
  barCode = signal('')
  duration = signal(0)
  private barCode$ = toObservable(this.barCode).pipe(
    filter(barcode => barcode !== ''),
    distinctUntilChanged(),
    debounceTime(300),
  )
  private duration$ = toObservable(this.duration).pipe(
    filter(d => d !== 0),
  )
  private stockList$ = combineLatest([this.refetch$, this.barCode$, this.duration$]).pipe(
    map(([_, barCode, duration]) => ({ barCode, duration })),
    tap(() => this.touch.set(true)),
    switchMap(
      params => this.stockItemService.getManyStock(params)
    )
  )
  durationList = computed(() => {
    const criteria = this.stockItemService.setup()
    return criteria.flatMap(({ stockMonth }) => [stockMonth, stockMonth / 2]).sort()
  })
  stockList = toSignal(this.stockList$, {
    initialValue: [{
      id: 1,
      goodName: 'test',
      barCode: '123456',
      unitDesc: 'unit',
      createAt: '2025-01-01',
      updateAt: null,
      goodCode: '1234',
      oldCost: 2,
      newCost: 5,
      priceW3: 3,
      saleMean: 120000,
      useMonth: 3,
      dnSale: 1200,
      dnUpsalePercent: 100,
      huSale: 1000,
      huUpsalePercent: 120,
      stockOnHand: 100,
      actualStock: 51
    }]
  })

  private toast = inject(ToastService)
  private modalService = inject(NgbModal);
  selectStock = signal<TMaybe<TQueryNewStockResponse>>(null)
  onSelectStock = (stock: TQueryNewStockResponse, ref: any) => {
    this.selectStock.set(stock);
    this.modalService.open(ref)
  }
  changeActualStock = (value: number) => this.selectStock.update(
    prev => prev === null
      ? null
      : typeof value === 'number'
        ? ({ ...prev, actualStock: value })
        : prev
  )
  onClose = () => {
    this.selectStock.set(null)
    this.modalService.dismissAll()
  }

  onSubmit = () => {
    const req = this.selectStock();
    if (req === null) {
      this.toast.danger('ไม่พบรายการตุน')
      return
    }
    this.stockItemService.updateNewStock(req).subscribe({
      next: (res) => {
        this.toast.success('แก้ไขสำเร็จ')
        this.refetch$.next(true)
        this.selectStock.set(null)
        this.modalService.dismissAll()
      },
      error: (err) => {
        this.toast.danger(this._castError(err))
      }
    })
  }

  private _castError = (err: any) => {
    if (err instanceof HttpErrorResponse) {
      return `staus ${err.status} : ${err.message}`
    }
    if (err instanceof Error) {
      return `app error : ${err.message}`
    }
    return `unknown error : ${err}`
  }

  private _reportFormaterr: Array<(value: TQueryNewStockResponse) => unknown> = [
    ({ createAt }) => createAt,
    ({ barCode }) => barCode,
    ({ goodName }) => goodName,
    ({ useMonth }) => useMonth,
    ({ huSale, huUpsalePercent, dnSale, dnUpsalePercent }) =>
      (huSale * huUpsalePercent + dnSale * dnUpsalePercent) / 100,
    ({ stockOnHand, unitDesc }) => `${stockOnHand} ${unitDesc}`,
    ({ huSale, huUpsalePercent, dnSale, dnUpsalePercent, actualStock }) =>
      `${actualStock * 100 / (huSale * huUpsalePercent + dnSale * dnUpsalePercent)} เดือน`,
    ({ actualStock, unitDesc }) => `${actualStock} ${unitDesc}`,
  ]

  onExport = async () => {
    const lst = this.stockList()
    const aoa = lst.map((l) => this._reportFormaterr.map(fn => fn(l)))
    await toXlxs(`ตุนสินค้า.xlsx`, 'sheet1', [
      ["วันที่บันทึก", "รหัสสินค้า", "ชื่อสินค้า", "ยอดใช้คำนวน (เดือน)", "ขายสินค้าเฉลี่ย (ชิ้น)", "stock ปัจจุบัน (ชิ้น)", "ระยะเวลาตุน (เดือน)", "จำนวนตุน (ชิ้น)",]
      , ...aoa]);
  }
}
