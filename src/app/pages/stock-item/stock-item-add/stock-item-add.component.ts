import { Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { StockItemApiService } from '../../../service/stock-item/stock-item-api.service';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TMaybe } from '../../../types';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, filter, map, Subject, switchMap, tap } from 'rxjs';
import { DecimalPipe, } from '@angular/common';
import { LoadingSkeletonComponent } from '../loading-skeleton.component';


@Component({
  selector: 'app-stock-item-add',
  imports: [FormsModule, DecimalPipe, LoadingSkeletonComponent],
  templateUrl: './stock-item-add.component.html',
  styleUrl: './stock-item-add.component.scss'
})
export class StockItemAddComponent {

  constructor() {
    const updateActualStock = effect(() => {
      const exp = this.expcetTotalItemCount()
      if (exp === null) {
        this.actualStock.set(0)
      } else {
        this.actualStock.set(exp)
      }
    })
  }
  touch = signal(false)
  private _SALE_CUTOFF = 100_000
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
    const { priceW3 } = gp
    const dnCost = this.dnCost()
    if (dnCost === 0) return 100 // avoid waste division
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

  private histSale$ = this.selectedCode$.pipe(
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

  expcetTotalItemCount = computed(() => {
    const rawCnt = this.expectItemCount()
    const useMonth = this.rawMonth()
    if (useMonth === null) return null
    const meanSale = this.selectSaleMean()
    if (meanSale === null) return null
    const calMonth = meanSale < this._SALE_CUTOFF ? useMonth / 2 : useMonth
    return Math.ceil(calMonth * rawCnt)
  })
  // reactive value
  actualStock = signal<number>(0)

  reset = () => {
    this.dnCost.set(0)
    this.addedDNStock.set(0)
    this.addedHUStock.set(0)
    this.actualStock.set(0)
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


  disableForm = computed(() => !this.isComplete() || this.riskPercent() === null || this.rawMonth() === null || this.selectSaleMean() === null)

  request = computed<TMaybe<TStockFormState>>(() => {
    const gp = this.gp();
    if (gp === null) return null
    const { priceW3, goodCode } = gp
    const oldCost = this.dnCost();
    const newCost = this.newCost();
    const saleMean = this.selectSaleMean()
    const riskPercent = this.riskPercent()
    if (riskPercent === null) return null
    if (saleMean === null) return null
    const dnSale = this.selectDNCount()
    if (dnSale === null) return null
    const huSale = this.selectHUCount()
    if (huSale === null) return null
    const rawMonth = this.rawMonth()
    if (rawMonth === null) return null
    const useMonth = saleMean < this._SALE_CUTOFF ? rawMonth / 2 : rawMonth
    const dnUpsalePercent = this.addedDNPercent()
    if (isNaN(dnUpsalePercent)) return null
    const huUpsalePercent = this.addedHUPercent()
    if (isNaN(huUpsalePercent)) return null
    const actualStock = this.actualStock()

    // computed value
    const dnExpectCount = dnSale * dnUpsalePercent / 100
    const huExpectCount = huSale * huUpsalePercent / 100
    const totalCount = dnSale + huSale
    const stockCount = Math.ceil(useMonth * totalCount)
    const expectTotalCount = dnExpectCount + huExpectCount
    const expectStock = Math.ceil(useMonth * expectTotalCount)
    return {
      goodCode, priceW3,
      oldCost, newCost, riskPercent,
      saleMean, rawMonth, useMonth,
      dnSale, huSale,
      dnUpsalePercent, huUpsalePercent,
      actualStock,
      // computed for display
      dnExpectCount, huExpectCount,
      totalCount, expectTotalCount,
      stockCount, expectStock,
    }
  })


  private _appReportHandler: Array<(state: TStockFormState) => TStockModification> = [
    ({ riskPercent }) => ({ fieldName: 'riskPercent', value: riskPercent, desc: 'ความเสี่ยง', className: 'row py-2 px-3' }),
    ({ rawMonth }) => ({ fieldName: 'rawMonth', value: rawMonth, desc: 'เดือนขั้นต้น', className: 'row py-2 px-3' }),
    ({ saleMean }) => ({ fieldName: 'mean', value: saleMean, desc: 'ยอดขาย DN', className: 'row py-2 px-3' }),
    ({ useMonth, saleMean }) => ({
      fieldName: 'useMonth', value: useMonth, className: 'row py-2 px-3 text-danger',
      desc: saleMean < this._SALE_CUTOFF ? 'ยอดขาย DN < 100,000 ปรับเดือนใช้' : 'ยอดขาย DN >= 100,000 ไม่ปรับเดือนใช้',
    }),
    // dn detail
    ({ dnSale }) => ({ fieldName: 'dnSale', value: dnSale, desc: 'จำนวนชิ้น DN (ชิ้น/เดือน)', className: 'row py-2 px-3 bg-info-subtle' }),
    ({ dnUpsalePercent }) => ({ fieldName: 'dnUpsalePercent', value: dnUpsalePercent, desc: 'จำนวนที่ตุนเพิ่ม DN (%)', className: 'row py-2 px-3 bg-info-subtle' }),
    ({ dnExpectCount }) => ({ fieldName: 'dnExpectCount', value: dnExpectCount, desc: 'จำนวนควรตุน DN (ชิ้น/เดือน)', className: 'row py-2 px-3 bg-info-subtle' }),
    ({ dnExpectCount, useMonth }) => ({ fieldName: 'dnStockCount', value: dnExpectCount * useMonth, desc: 'จำนวนควรตุน DN (ชิ้น)', className: 'row py-2 px-3  bg-info-subtle' }),
    // hu detail
    ({ huSale }) => ({ fieldName: 'huSale', value: huSale, desc: 'จำนวนชิ้น HU (ชิ้น/เดือน)', className: 'row py-2 px-3 bg-primary-subtle' }),
    ({ huUpsalePercent }) => ({ fieldName: 'huUpsalePercent', value: huUpsalePercent, desc: 'จำนวนที่ตุนเพิ่ม HU (%)', className: 'row py-2 px-3 bg-primary-subtle' }),
    ({ huExpectCount }) => ({ fieldName: 'huExpectCount', value: huExpectCount, desc: 'จำนวนควรตุน HU (ชิ้น/เดือน)', className: 'row py-2 px-3 bg-primary-subtle' }),
    ({ huExpectCount, useMonth }) => ({ fieldName: 'huStockCount', value: huExpectCount * useMonth, desc: 'จำนวนควรตุน HU (ชิ้น)', className: 'row py-2 px-3 bg-primary-subtle' }),
    // summary
    ({ totalCount }) => ({ fieldName: 'totalCount', value: totalCount, desc: 'จำนวนสินค้าขั้นต้น (ชิ้น/เดือน)', className: 'row py-2 px-3 bg-success-subtle' }),
    ({ expectTotalCount }) => ({ fieldName: 'expectTotalCount', value: expectTotalCount, desc: 'จำนวนสินค้า (ชิ้น/เดือน)', className: 'row py-2 px-3 bg-success-subtle' }),
    ({ stockCount }) => ({ fieldName: 'stockCount', value: stockCount, desc: 'จำนวนที่ตุนได้ (ชิ้น)', className: 'row py-2 px-3 bg-success-subtle' }),
    ({ expectStock }) => ({ fieldName: 'expectStock', value: expectStock, desc: 'จำนวนที่ควรตุน (ชิ้น)', className: 'row py-2 px-3 bg-success-subtle' }),
    ({ actualStock, useMonth }) => useMonth === 0
      ? ({ fieldName: 'actualMonth', value: 'คำนวนไม่ได้', desc: 'ตุนได้จริง (เดือน)', className: 'row py-2 px-3 text-danger bg-success-subtle' })
      : ({ fieldName: 'actualMonth', value: actualStock / useMonth, desc: 'ตุนได้จริง (เดือน)', className: 'row py-2 px-3  bg-success-subtle' }),
  ]

  modification = computed(() => {
    const state = this.request()
    if (state === null) return []
    return this._appReportHandler.map(fn => fn(state))
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
  className: string
}


type TStockFormState = {
  goodCode: string
  priceW3: number
  oldCost: number
  newCost: number
  riskPercent: number
  saleMean: number // month from criteria
  rawMonth: number // rawMonth || rawMonth/2
  useMonth: number
  dnSale: number
  huSale: number
  dnUpsalePercent: number
  huUpsalePercent: number
  expectStock: number // expected stock = (dn + hu sale + upsale percent ) * useMonth // expectTotalCount * useMonth
  actualStock: number
  // computed for display
  dnExpectCount: number
  huExpectCount: number
  totalCount: number // hu sale /mo + dn sale /mo
  expectTotalCount: number // totalCount * upsale for each company
  stockCount: number // totalCount * useMonth
}