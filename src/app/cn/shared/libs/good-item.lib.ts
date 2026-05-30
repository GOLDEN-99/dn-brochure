import { TGoodFormItem, TGoodItemReq } from '../types/cn.type';
import { TGoodItem } from '../types/cn.type';

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

export const mapReturnListToGoodReq = (returnList: TGoodFormItem[]): TGoodItemReq[] =>
    returnList.map(({ good: { goodCode, orderAmount, unitCode, unitPrice, subTotal } }) => ({
        goodcode: goodCode,
        goodAmou: orderAmount,
        unitcode: unitCode,
        unitprice: unitPrice,
        subtotal: subTotal,
    }))

export const mapCheckedReturnListToGoodReq = (returnList: TGoodFormItem[]): TGoodItemReq[] =>
    returnList.flatMap(({ check, good: { goodCode, unitCode, unitPrice }, amount }) =>
        check
            ? [{ goodcode: goodCode, goodAmou: amount, unitcode: unitCode, unitprice: unitPrice, subtotal: unitPrice * amount }]
            : []
    )
