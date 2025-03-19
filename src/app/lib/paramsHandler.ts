import { ActivatedRouteSnapshot } from "@angular/router";
import { predicateEmpty, predicatePromo, predicateString, predicateWhole } from "./predicate";

export const paramsHandler = (key: string) => <T>(predicate: TPredicateFn<T>) => (route: ActivatedRouteSnapshot) => {
    const value = route.paramMap.get(key)
    if (!predicateEmpty(value)) throw new Error('cannot get params')
    if (!predicate(value)) throw new Error('invalid param')
    return value
}

export const paramsHandlerV2 = (key: string) => (route: ActivatedRouteSnapshot) => {
    const value = route.paramMap.get(key)
    if (!predicateEmpty(value)) throw new Error('cannot get params')
    switch (value) {
        case '1': return true
        case '0': return false
        default: throw new Error('invalid boolean')
    }
}

type TPredicateFn<T> = (value: unknown) => value is T

export const promoHandler = paramsHandler('promoType')(predicatePromo)
export const isNewHandler = paramsHandlerV2('isNew')
export const isBkkHandler = paramsHandlerV2('isBkk')
export const wholeHandler = paramsHandler('wholeType')(predicateWhole)
export const tokenHandler = paramsHandler('token')(predicateString)

