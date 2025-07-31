import { computed, inject, Injectable, signal } from '@angular/core';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TBaseOIHead, TBaseOiInsert } from '../../types';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OiBaseformService {

  constructor() { }
  private calendar = inject(NgbCalendar)
  private today = this.calendar.getToday()

  defaultValue: TAppBaseformInsert = {
    compCode: '',
    compType: 'DN',
    compName: '',
    eventId: 0,
    period: 0,
    startDate: this.today,
    endDate: this.today,
  }
  compData = computed(() => {
    const { compCode, compType } = this.baseformState()
    return { compCode, compType }
  })

  baseformState = signal(this.defaultValue)

  updateOneField = <K extends keyof TAppBaseformInsert>(key: K) => (value: TAppBaseformInsert[K]) => {
    this.baseformState.update(prev => ({ ...prev, [key]: value }))
  }

  updateManyField = <P = Partial<TAppBaseformInsert>>(patch: P) => this.baseformState.update(prev => ({ ...prev, ...patch }))

  get request(): TApiBaseformInsert {
    const { startDate, endDate, ...res } = this.baseformState()
    return { ...res, startDate: this.toIso(startDate), endDate: this.toIso(endDate) }
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

  resetForm = () => this.baseformState.set(this.defaultValue)

}

export type TAppBaseformInsert = TBaseOiInsert<'app'>
export type TApiBaseformInsert = TBaseOiInsert<'api'>
