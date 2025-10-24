import { TFormattedLoginResponse, TLoginOrder, TModifiedComp } from "../../types/ibob-supplier.type"
import { TPraser, TPraserOption } from "./local-lib.type"

const isExp = (exp: number) => {
    const unix = (new Date()).getTime()
    return unix > exp
}

export const setItem = (key: string, exp: () => number) =>
    (value: unknown) => {
        const txt = JSON.stringify({ data: value, exp: exp() })
        localStorage.setItem(key, txt)
    }

export const getItem = <T, K>({ praser, fallback }: TPraserOption<T, K>) => (key: string) => () => {
    try {
        const txtData = localStorage.getItem(key)
        if (!txtData) return fallback
        const { data, exp } = JSON.parse(txtData) as any
        if (isExp(exp)) return fallback
        const prasedData = praser(data)
        return prasedData
    } catch (err) {
        console.error(err)
        return fallback
    }
}

const isString = (value: any): string => {
    if (typeof value !== 'string') return ''
    return value
}

const praseStr = (data: any) => (fieldName: string) => {
    const raw = data[fieldName]
    if (typeof raw !== 'string') throw new Error(`cannot get value of ${fieldName}`)
    return raw
}

const praseComp = (data: any): TModifiedComp => {
    if (typeof data !== "object") throw new Error('cannot get comp')
    const praseStrWithObj = praseStr(data)
    const compCode = praseStrWithObj('compCode')
    const compName = praseStrWithObj('compName')
    const compName2 = praseStrWithObj('compName2')
    const shipto = praseStrWithObj('shipto')
    const compEmail = praseStrWithObj('compEmail')
    const compPhone = praseStrWithObj('compPhone')
    const saleName = ''
    return {
        compName,
        compCode,
        compName2,
        compPhone,
        compEmail,
        shipto,
        saleName
    }
}

const praseLoginOrder = (value: any): TLoginOrder => {
    try {

        const praseStrWithObj = praseStr(value)
        const orderNumb = praseStrWithObj('orderNumb')
        const orderDate = praseStrWithObj('orderDate')
        return { orderDate, orderNumb }
    } catch (err) {
        console.error(err)
        throw err
    }
}

export const loginPraser: TPraser<Omit<TFormattedLoginResponse, 'expireIn'>> = (data: any) => {
    const comp = praseComp(data?.comp)
    const token = isString(data?.token)
    const rawOrder = data.order
    if (!Array.isArray(rawOrder)) throw new Error('cannot get order')
    const order = rawOrder.map((val) => praseLoginOrder(val)
    )

    return {
        comp,
        order,
        token
    }
}