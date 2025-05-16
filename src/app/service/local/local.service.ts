import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalService {

  constructor() { }

  private addTime = (factor: number) => (value: number) => {
    const current = (new Date()).getTime()
    return current + factor * value
  }

  private addDay = this.addTime(24 * 60 * 60 * 1000)
  private addHour = this.addTime(60 * 60 * 1000)
  private addMin = this.addTime(60 * 1000)

  private isExp = (exp: number) => {
    const unix = (new Date()).getTime()
    return unix > exp
  }

  private setItem = <K extends TStorageKey>(key: K, exp: number) =>
    (value: TBaseStorage[K]) => {
      const expIn = this.addHour(exp)
      const txt = JSON.stringify({ data: value, exp: expIn })
      localStorage.setItem(key, txt)
    }

  private getItem = <K extends TStorageKey>(key: K) => () => {
    const txtData = localStorage.getItem(key)
    if (!txtData) return null
    const { data, exp } = JSON.parse(txtData) as TStorageMap[K]
    if (this.isExp(exp)) return null
    return data
  }

  saveToken = this.setItem('dnToken', 1)
  loadToken = this.getItem('dnToken')
}

type TBaseStorageItem<T> = {
  data: T
  exp: number
}

type TBaseStorage = {
  dnToken: string
}
type TStorageKey = keyof TBaseStorage

type TMapToStorage<T extends Record<string, unknown>> = {
  [key in keyof T]: TBaseStorageItem<T[key]>
}

type TStorageMap = TMapToStorage<TBaseStorage>

