import { TPromotionType, TWhole } from "../types"

export const predicateEmpty = <T = unknown>(value: T): value is NonNullable<T> => {
    if (typeof value === 'undefined') return false
    if (value === null) return false
    return true
}

export const predicateBool = (value: unknown): value is boolean => {
    return typeof value === 'boolean'
}

export const predicatePromo = (value: unknown): value is TPromotionType => {
    return value === 'Monthly' || value === 'Hot' || value === 'SP'
}

export const predicateWhole = (value: unknown): value is TWhole => {
    return value === 'Normal' || value === 'Dental' || value === 'Clinic'
}

export const predicateString = (value: unknown): value is string => {
    return typeof value === 'string'
}

export const predicateNumber = (value: unknown): value is `${number}` => {
    const prased = Number(value)
    if (isNaN(prased)) return false
    return true
}