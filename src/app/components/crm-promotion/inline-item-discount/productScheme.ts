import { schema, validate } from "@angular/forms/signals";
import { TInlinePool, TProductDetail } from "../../../types/crm-promotion.type";


export type TProductState = { discount: number } & Pick<TProductDetail, 'goodName' | 'goodCode' | 'sku'>

type TUniqueMap<T extends Record<string, unknown>> = Record<string, T>

export interface IProductDiscount {
    productMap: TUniqueMap<TInlinePool>
}

export const initialData: IProductDiscount = { productMap: {} }

export const productDiscountSchema = schema<IProductDiscount>((path) => {
    validate(path, (ctx) => Object.keys(ctx.value()).length > 0 ? null : { kind: 'list', message: 'product list must not empty' })

})