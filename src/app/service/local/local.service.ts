import { Injectable } from '@angular/core';
import { loginPraser } from './local-lib';

@Injectable({
  providedIn: 'root'
})
export class LocalService {

  constructor() { }

  private readonly addTime = (factor: number) => (value: number) => {
    const current = Date.now()
    return current + factor * value
  }

  private readonly addDay = this.addTime(24 * 60 * 60 * 1000)
  private readonly addHour = this.addTime(60 * 60 * 1000)
  private readonly addMin = this.addTime(60 * 1000)

  private readonly isExp = (exp: number) => {
    const unix = Date.now()
    return unix > exp
  }

  private readonly setItem = (key: string, exp: () => number) =>
    (value: unknown) => {
      const txt = JSON.stringify({ data: value, exp: exp() })
      localStorage.setItem(key, txt)
    }

  private readonly getItem = <T>(praser: (value: unknown) => T | null) => (key: string) => () => {
    try {
      const txtData = localStorage.getItem(key)
      if (!txtData) throw new Error(`no data with key ${key}`)
      const { data, exp } = JSON.parse(txtData)
      if (this.isExp(exp)) throw new Error('expired data')
      const prasedData = praser(data)
      return prasedData
    } catch (err) {
      console.error(err)
      return null
    }
  }

  private readonly jwtPraser = (data: unknown) => {
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


