import { Injectable } from '@angular/core';
import { TMaybe } from '../../types';
import { TComp, TModifiedComp } from '../../types/ibob-supplier.type';
import { loginPraser } from './local-lib';

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

  private setItem = (key: string, exp: () => number) =>
    (value: unknown) => {
      const txt = JSON.stringify({ data: value, exp: exp() })
      localStorage.setItem(key, txt)
    }

  private getItem = <T>(praser: (value: unknown) => T | null) => (key: string) => () => {
    try {
      const txtData = localStorage.getItem(key)
      if (!txtData) throw new Error(`no data with key ${key}`)
      const { data, exp } = JSON.parse(txtData) as any
      if (this.isExp(exp)) throw new Error('expired data')
      const prasedData = praser(data)
      return prasedData
    } catch (err) {
      console.error(err)
      return null
    }
  }

  private jwtPraser = (data: unknown) => {
    const str = String(data)
    const tokenPart = str.split('.')
    if (tokenPart.length !== 3) return null
    const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
    const isBase64 = tokenPart.every(part => base64UrlRegex.test(part) && part.length > 0)
    return isBase64 ? str : ''
  }

  setLoginResponse = ({ compType, user }: TAuthStorageKey, exp: () => number = () => this.addHour(12)) => this.setItem(`${compType.toLowerCase()}-${user}`, exp)
  getLoginResponse = ({ compType, user }: TAuthStorageKey) => this.getItem(loginPraser)(`${compType.toLowerCase()}-${user}`)
}

type TBaseStorageItem<T> = {
  data: T
  exp: number
}

export type TAuthStorageKey = {
  compType: string
  user: string
}


