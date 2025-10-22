import { Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { StockItemApiService, TDNSaleResponse } from '../../../service/stock-item/stock-item-api.service';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TMaybe } from '../../../types';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounce, debounceTime, filter, forkJoin, map, retry, startWith, Subject, switchMap, tap } from 'rxjs';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-stock-item-add',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './stock-item-add.component.html',
  styleUrl: './stock-item-add.component.scss'
})
export class StockItemAddComponent {

  constructor() {
    const updateActualStock = effect(() => {
      const exp = this.expcetTotalItemCount()
      if (exp === null) {
        this.stockOrder.set(0)
      } else {
        this.stockOrder.set(exp)
      }
    })
  }
  touch = signal(false)
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
    this.reset()
    this.touch.set(true)
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

  private histSale$ = this.selectedCode$
    .pipe(
      debounceTime(50),
      switchMap(c => this.stockItemServ.getHistSale(c)),
      tap((res) => {
        if (res !== null) {
          this._canFetch.next()
        }
      })
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

  isReduceMonth = computed(() => {
    const mean = this.selectSaleMean()
    if (mean === null) return null
    return mean < 100_000
  })

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

  isComplete = computed(() => this.histSale() !== null && this.huItemCount() !== null)

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

  // reactive value
  addedDNStock = signal(0)
  addedDNPercent = computed(() => Number(this.addedDNStock()) + 100)
  expectDNCount = computed(() => {
    const dnCnt = this.selectDNCount()
    const factor = this.addedDNPercent() / 100
    if (dnCnt === null) return null
    return factor * dnCnt
  })
  // reactive value
  addedHUStock = signal(0)
  addedHUPercent = computed(() => Number(this.addedHUStock()) + 100)
  expectHUCount = computed(() => {
    const huCnt = this.selectHUCount()
    const factor = this.addedHUPercent() / 100
    if (huCnt === null) return null
    return factor * huCnt
  })
  rawItemCount = computed(() => {
    let cnt = 0;
    const dnCnt = this.selectDNCount()
    if (dnCnt !== null) {
      cnt += dnCnt
    }
    const huCnt = this.selectHUCount()
    if (huCnt !== null) {
      cnt += huCnt
    }
    return cnt
  })
  expectItemCount = computed(() => {
    let cnt = 0;
    const dnCnt = this.expectDNCount()
    if (dnCnt !== null) {
      cnt += dnCnt
    }
    const huCnt = this.expectHUCount()
    if (huCnt !== null) {
      cnt += huCnt
    }
    return cnt
  })
  totalItemCount = computed(() => {
    const rawCnt = this.rawItemCount()
    const useMonth = this.rawMonth()
    if (useMonth === null) return null
    const isReduced = this.isReduceMonth()
    if (isReduced === null) return null
    const calMonth = isReduced ? useMonth / 2 : useMonth
    return Math.ceil(calMonth * rawCnt)
  })
  expcetTotalItemCount = computed(() => {
    const rawCnt = this.expectItemCount()
    const useMonth = this.rawMonth()
    if (useMonth === null) return null
    const isReduced = this.isReduceMonth()
    if (isReduced === null) return null
    const calMonth = isReduced ? useMonth / 2 : useMonth
    return Math.ceil(calMonth * rawCnt)
  })
  // reactive value
  stockOrder = signal<number>(0)

  modification = computed(() => {
    const res: TStockModification[] = []
    const riskPercent = this.riskPercent()
    const rawMonth = this.rawMonth()
    if (riskPercent !== null) {
      res.push({ fieldName: 'riskPercent', value: riskPercent, desc: 'ความเสี่ยง', className: 'row py-2 px-3 ' })
    }
    if (rawMonth === null) return res
    let calMonth = rawMonth
    res.push({ fieldName: 'rawMonth', value: rawMonth, desc: 'เดือนขั้นต้น', className: 'row py-2 px-3 ' })
    const mean = this.selectSaleMean()
    if (mean === null) return res
    res.push({ fieldName: 'mean', value: mean, desc: 'ยอดขาย DN', className: 'row py-2 px-3 ' })
    if (mean < 100000) {
      calMonth = calMonth / 2
      res.push({ fieldName: 'useMonth', value: calMonth, desc: 'ยอดขาย DN < 100,000 ปรับเดือนใช้', className: 'row py-2 px-3 text-danger' })
    } else {
      res.push({ fieldName: 'useMonth', value: calMonth, desc: 'ยอดขาย DN >= 100,000 ไม่ปรับเดือนใช้', className: 'row py-2 px-3 text-danger' })
    }
    let total = 0
    let actualPerMonth = 0
    let actualTotal = 0
    const dnCnt = this.selectDNCount()
    const actualDN = this.addedDNPercent()
    if (dnCnt !== null) {
      total += dnCnt
      res.push({ fieldName: 'dnCount', value: dnCnt, desc: 'จำนวนชิ้น DN', className: 'row py-2 px-3  bg-info-subtle' })
      res.push({ fieldName: 'actualDNPercent', value: actualDN, desc: 'จำนวนที่ตุนเพิ่ม DN (%)', className: 'row py-2 px-3  bg-info-subtle' })
      const actualDNMean = actualDN * dnCnt / 100
      actualPerMonth += actualDNMean
      res.push({ fieldName: 'actualDNMean', value: actualDNMean, desc: 'จำนวนควรตุน DN (ชิ้น/เดือน)', className: 'row py-2 px-3  bg-info-subtle' })
      const actualDNCount = actualDNMean * calMonth
      actualTotal += actualDNCount
      res.push({ fieldName: 'totalDNCount', value: actualDNCount, desc: 'จำนวนคสรตุน DN (ชิ้น)', className: 'row py-2 px-3  bg-info-subtle' })

    }
    const huCnt = this.selectHUCount()
    const actualHU = this.addedHUPercent()
    if (huCnt !== null) {
      total += huCnt
      res.push({ fieldName: 'huCount', value: huCnt, desc: 'จำนวนชิ้น HU', className: 'row py-2 px-3  bg-primary-subtle' })
      res.push({ fieldName: 'actualHUPercent', value: actualHU, desc: 'จำนวนที่ตุนเพิ่ม HU (%)', className: 'row py-2 px-3  bg-primary-subtle' })
      const actualHUMean = actualHU * huCnt / 100
      actualPerMonth += actualHUMean
      res.push({ fieldName: 'actualHUMean', value: actualHUMean, desc: 'จำนวนควรตุน HU (ชิ้น/เดือน)', className: 'row py-2 px-3  bg-primary-subtle' })
      const actualHUCount = actualHUMean * calMonth;
      actualTotal += actualHUCount
      res.push({ fieldName: 'totalHUCount', value: actualHUCount, desc: 'จำนวนควรตุน HU (ชิ้น)', className: 'row py-2 px-3  bg-primary-subtle' })
    }
    res.push({ fieldName: 'totalCount', value: total, desc: 'จำนวนสินค้าขั้นต้น (ชิ้น/เดือน)', className: 'row py-2 px-3 ' })
    res.push({ fieldName: 'totalCountMonth', value: actualPerMonth, desc: 'จำนวนสินค้า (ชิ้น/เดือน)', className: 'row py-2 px-3 ' })
    const stockOrderAmount = this.stockOrder()

    res.push({ fieldName: 'actualOrder', value: stockOrderAmount, desc: 'จำนวนที่ตุนได้ (ชิ้น)', className: 'row py-2 px-3  bg-success-subtle' })
    if (actualPerMonth === 0) {
      res.push({ fieldName: 'actualMonth', value: 'คำนวนไม่ได้', desc: 'ตุนได้จริง (เดือน)', className: 'row py-2 px-3  bg-success-subtle' })
    } else {
      res.push({ fieldName: 'actualMonth', value: stockOrderAmount / actualPerMonth, desc: 'ตุนได้จริง (เดือน)', className: 'row py-2 px-3  bg-success-subtle' })
    }
    return res
  })

  reset = () => {
    this.dnCost.set(0)
    this.addedDNStock.set(0)
    this.addedHUStock.set(0)
    this.stockOrder.set(0)
  }

  private _getMeanClass = (ref: Signal<number | null>) => (mean: number) => {
    const selectedMean = ref()
    if (mean === selectedMean && mean !== 0) return 'bg-success-subtle col p-2 text-success-emphasis'
    return 'col p-2'
  }

  getCriteriaClass = (month: number) => {
    const rawMonth = this.rawMonth()
    return month === rawMonth ? 'list-group-item d-flex justify-content-between bg-success-subtle text-success-emphasis' : 'list-group-item d-flex justify-content-between'
  }
  getSaleMeanClass = this._getMeanClass(this.selectSaleMean)
  getDNCountMeanClass = this._getMeanClass(this.selectDNCount)
  getHUCountMeanClass = this._getMeanClass(this.selectHUCount)
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
  className: string
}