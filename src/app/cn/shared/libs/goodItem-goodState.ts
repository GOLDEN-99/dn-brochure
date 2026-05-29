import { TGoodFormItem } from "../services/cn-state.service";
import { TGoodItem } from "../types/cn.type";

export const mapGoodItemToState = ({ lot, ...res }: TGoodItem) => {
    return {
        ...res,
        orderAmount: lot.reduce((acc, cur) => acc + cur.goodAmou, 0)
    }
}

export const mapGoodItemToForm =
    ({ goodCode, barCode, goodName, unitDesc, unitPrice, unitCode, subTotal, useItem, lot }: TGoodItem): TGoodFormItem =>
    ({
        good: {
            goodCode, barCode, goodName,
            unitDesc, unitPrice, unitCode,
            subTotal, useItem, orderAmount: lot.reduce((acc, cur) => acc + cur.goodAmou, 0)
        }, amount: 0, check: false
    })
