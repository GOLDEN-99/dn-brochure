import { computed, inject, Injectable, signal } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TBaseOIHead, TBaseOiInsert, TOIProduct } from '../../types';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter } from 'rxjs';
import { OiProductService } from './oi-product.service';

@Injectable({
  providedIn: 'root'
})
export class OiBaseformService {

  constructor() { }
  private calendar = inject(NgbCalendar)
  private today = this.calendar.getToday()
  private fdoy = new NgbDate(this.today.year, 1, 1)
  private ldoy = new NgbDate(this.today.year, 12, 31)

  defaultValue: TAppBaseformInsert = {
    compCode: '',
    compType: 'DN',
    compName: '',
    eventId: 0,
    incomeId: 0,
    period: 0,
    startDate: this.fdoy,
    endDate: this.ldoy,
    displayName: 'ไม่ระบุ'
  }
  compData = computed(() => {
    const { compCode, compType } = this.baseformState()
    return { compCode, compType }
  })
  productList = signal<TOIProduct[] | null>(null)

  baseformState = signal(this.defaultValue)
  searchProductParam = computed(() => {
    const { compCode, compType } = this.baseformState()
    return { compCode, compType }
  })
  searchProduct$ = toObservable(this.searchProductParam).pipe(
    filter(({ compCode }) => compCode !== ''),
    distinctUntilChanged((prev, cur) => {
      if (prev.compType !== cur.compType) return false
      return prev.compCode === cur.compCode
    }),
  )
  updateOneField = <K extends keyof TAppBaseformInsert>(key: K) => (value: TAppBaseformInsert[K]) => {
    this.baseformState.update(prev => ({ ...prev, [key]: value }))
  }

  updateManyField = <P = Partial<TAppBaseformInsert>>(patch: P) => this.baseformState.update(prev => ({ ...prev, ...patch }))

  get request(): TApiBaseformInsert {
    const { startDate, endDate, ...res } = this.baseformState()
    const productList = this.productList()
    const formatList = productList ? productList.map(({ goodCode }) => goodCode) : null
    return { ...res, startDate: this.toIso(startDate), endDate: this.toIso(endDate), productList: formatList }
  }

  private toIso = (date: NgbDateStruct) => {
    const { year, month, day } = date
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  private api = inject(ApiService)
  private url = environment.oi
  createHead = () => {
    const req = this.request
    return this.api.post<{ id: number }>(`${this.url}/other-income/contact/head`, req)
  }

  resetForm = () => {
    this.baseformState.set(this.defaultValue);
    this.productList.set(null)
  }
  disableDc = computed(() => {
    const { compCode, compName, eventId, incomeId } = this.baseformState()
    return compCode === '' || compName === '' || eventId === 0 || incomeId === 0
  })
}

export type TAppBaseformInsert = TBaseOiInsert<'app'>
export type TApiBaseformInsert = TBaseOiInsert<'api'> & { productList: string[] | null }
