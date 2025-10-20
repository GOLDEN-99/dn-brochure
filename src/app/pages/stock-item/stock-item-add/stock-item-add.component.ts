import { Component, computed, inject, Signal, signal } from '@angular/core';
import { StockItemApiService, TDNSaleResponse } from '../../../service/stock-item/stock-item-api.service';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TMaybe } from '../../../types';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounce, debounceTime, filter, forkJoin, map, retry, Subject, switchMap, tap } from 'rxjs';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-stock-item-add',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './stock-item-add.component.html',
  styleUrl: './stock-item-add.component.scss'
})
export class StockItemAddComponent {
  private stockItemServ = inject(StockItemApiService)
  private modalServ = inject(NgbModal)
  modeList = [{ key: "goodCode", label: 'รหัสสินค้า' }, { key: "goodName", label: "ชื่อสินค้า" }]
  mode = signal("goodCode")
  onModeChange = (mode: string) => {
    this.mode.set(mode);
    this.stockItemServ.resetSearch();
  }
  isCode = signal(() => this.mode() === "goodCode")

  openSearchProductModal = (ref: any) => {
    this.modalServ.open(ref, { size: 'lg' });
  }
  search = this.stockItemServ.searchProductTerm
  searchName = (goodName: string) => this.search.update(prev => ({ ...prev, goodName }))
  searchCode = (goodCode: string) => this.search.update(prev => ({ ...prev, goodCode }))
  productList = this.stockItemServ.searchProductResult

  selectedProduct = signal<TMaybe<TBaseProduct>>(null)
  private selectedCode = computed(() => this.selectedProduct()?.goodCode ?? "")
  private selectedCode$ = toObservable(this.selectedCode).pipe(filter(code => code !== ''))
  private gp$ = this.selectedCode$.pipe(
    switchMap(c => this.stockItemServ.getGoodGP(c)),
    tap((res) => {
      if (res !== null) {
        this.dnCost.set(res.dnCost)
        this.newCost.set(res.dnCost)
      }
    }))
  gp = toSignal(this.gp$, { initialValue: null })
  costChange = computed(() => {
    const oldCost = this.dnCost()
    if (oldCost === 0) return 0
    const newCost = this.newCost()
    return (newCost - oldCost) / oldCost * 100
  })
  gpPercent = computed(() => {
    const gp = this.gp()
    if (gp === null) return 0
    const { priceW3, dnCost } = gp
    return (priceW3 - dnCost) / priceW3 * 100
  })
  riskPercent = computed(() => {
    const costChange = this.costChange()
    const gpPercent = this.gpPercent()
    if (gpPercent === 0) return null
    return Number((costChange / gpPercent * 100).toFixed(2))
  })
  onAddProduct(product: TBaseProduct) {
    this.selectedProduct.set(product);
    this.modalServ.dismissAll();
    this.stockItemServ.resetSearch();
  }
  dnCost = signal(0)
  newCost = signal(0)

  appCriteria = this.stockItemServ.setup
  rawMonth = computed(() => {
    const appC = this.appCriteria()
    const risk = this.riskPercent()
    if (risk === null) return null
    for (let i = appC.length - 1; i >= 0; i--) {
      const { riskPercent, stockMonth } = appC[i]
      if (risk >= riskPercent) return stockMonth
    }
    return null
  })



  private _getMeanClass = (ref: Signal<number | null>) => (mean: number) => {
    const selectedMean = ref()
    if (mean === selectedMean && mean !== 0) return 'bg-success-subtle col p-2 text-success-emphasis'
    return 'col p-2'
  }



  getCriteriaClass = (month: number) => {
    const rawMonth = this.rawMonth()
    return month === rawMonth ? 'list-group-item d-flex justify-content-between bg-success-subtle text-success-emphasis' : 'list-group-item d-flex justify-content-between'
  }
  private histSale$ = this.selectedCode$
    .pipe(
      debounceTime(50),
      switchMap(c => this.stockItemServ.getHistSale(c)),
      tap(() => this._canFetch.next())
    )
  histSale = toSignal(this.histSale$, { initialValue: null })
  histSaleTotal = computed(() => {
    const res = this.histSale()
    if (res === null) return null
    const { short, long, saleList } = res
    return {
      short: short.totalMean,
      long: long.totalMean,
      saleList
    }
  })
  selectSaleMean = computed(() => {
    const res = this.histSaleTotal()
    if (res === null) return null
    const { short, long } = res
    return this._selectMean({ short, long })
  })
  getSaleMeanClass = this._getMeanClass(this.selectSaleMean)

  histSaleCount = computed(() => {
    const res = this.histSale()
    if (res === null) return null
    const { short, long, countList } = res
    return {
      short: short.countMean,
      long: long.countMean,
      countList
    }
  })
  selectDNCount = computed(() => {
    const res = this.histSaleCount()
    if (res === null) return null
    const { short, long } = res
    return this._selectMean({ short, long })
  })
  getDNCountMeanClass = this._getMeanClass(this.selectDNCount)

  private _selectMean = ({ short, long }: { short: number, long: number }) => {
    if (long === 0) return short
    const upperBound = 1.3 * long
    if (short > upperBound) return long
    const lowerBound = 0.7 * long
    if (short < lowerBound) return long
    return short
  }
  private _canFetch = new Subject<void>()
  huItemCount$ = combineLatest([this._canFetch, this.selectedCode$]).pipe(
    map(([_, code]) => code),
    switchMap(goodCode => this.stockItemServ.getHUSaleCount(goodCode)),
  )
  huItemCount = toSignal(this.huItemCount$, { initialValue: null })
  selectHUCount = computed(() => {
    const res = this.huItemCount()
    if (res === null) return null
    const { short, long } = res
    return this._selectMean({ short, long })
  })
  getHUCountMeanClass = this._getMeanClass(this.selectHUCount)

  realStockAmou = signal(0)

  modification = computed(() => {
    const res: TStockModification[] = []
    const riskPercent = this.riskPercent()
    const rawMonth = this.rawMonth()
    if (riskPercent !== null) {
      //res.push(`ความเสี่ยง ${riskPercent} % คิดเป็น ${rawMonth} เดือน`)
      res.push({ fieldName: 'riskPercent', value: riskPercent, desc: 'ความเสี่ยง' })
    }
    if (rawMonth === null) return res
    let calMonth = rawMonth
    res.push({ fieldName: 'rawMonth', value: rawMonth, desc: 'เดือนขั้นต้น' })
    const mean = this.selectSaleMean()
    if (mean === null) return res
    res.push({ fieldName: 'mean', value: mean, desc: 'ยอดขาย DN' })
    if (mean < 100000) {
      //res.push(`ยอดขายย้อนหลังน้อยกว่า 100,000 คิด ${rawMonth / 2}`)
      calMonth = calMonth / 2
      res.push({ fieldName: 'useMonth', value: calMonth, desc: 'ยอดขาย DN < 100,000 ปรับเดือนใช้' })
    } else {
      res.push({ fieldName: 'useMonth', value: calMonth, desc: 'ยอดขาย DN >= 100,000 ไม่ปรับเดือนใช้' })
    }
    let total = 0
    const dnCnt = this.selectDNCount()
    if (dnCnt !== null) {
      total += dnCnt
      res.push({ fieldName: 'dnCount', value: dnCnt, desc: 'จำนวนชิ้น DN' })
    }
    const huCnt = this.selectHUCount()
    if (huCnt !== null) {
      total += huCnt
      res.push({ fieldName: 'dnCount', value: huCnt, desc: 'จำนวนชิ้น HU' })
    }
    res.push({ fieldName: 'totalCount', value: total, desc: 'จำนวนสินค้า (ชิ้น/เดือน)' })
    const stockAmount = Math.ceil(total * calMonth)
    res.push({ fieldName: 'stockAmou', value: stockAmount, desc: 'จำนวนที่ควรตุน (ชิ้น)' })
    const actual = this.realStockAmou()
    res.push({ fieldName: 'actualStockAmou', value: actual, desc: 'จำนวนที่ตุนได้ (ชิ้น)' })
    res.push({ fieldName: 'actualMonth', value: actual / total, desc: 'ตุนได้จริง (เดือน)' })
    return res
  })
}

type TBaseProduct = {
  goodCode: string
  goodName: string
  barCode: string
  goodStat: boolean
}


type TStockModification<T = unknown> = {
  fieldName: string
  desc: string
  value: T
}