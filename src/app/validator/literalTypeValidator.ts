import { TPromotionType } from "../types";

export const promoTypValidator = (value: unknown): value is TPromotionType => {
    if (typeof value !== 'string') return false
    return value === 'Monthly' || value === 'SP' || value === 'Hot'
}