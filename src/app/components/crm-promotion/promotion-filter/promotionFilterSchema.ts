import { disabled, schema } from "@angular/forms/signals"
import { TPromotionFilterForm } from "../../../types/crm-promotion.type"



export const initialPromtionFilterForm: TPromotionFilterForm = {
    productCondition: 'SKU',
    productList: {},
    thresholdType: 'BATH',
    thresholdValue: 0
}

export const promotionFilterFormSchema = schema<TPromotionFilterForm>((path) => {
    disabled(path.thresholdValue, (ctx) => ctx.valueOf(path.thresholdType) === 'EXIST')
})