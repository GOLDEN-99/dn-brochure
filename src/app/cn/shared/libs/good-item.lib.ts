import { TGoodFormItem, TGoodItemReq, TGoodWithLot } from '../types/cn.type';

export const mapGoodItemToState = ({ lot, ...res }: TGoodWithLot) => {
    return {
        ...res,
        goodAmou: lot.reduce((acc, cur) => acc + cur.goodAmou, 0)
    }
}

export const mapGoodItemToForm =
    ({ goodCode, barCode, goodName, unitDesc, unitPrice, unitCode, subTotal, useItem, lot }: TGoodWithLot): TGoodFormItem =>
    ({
        good: {
            goodCode, barCode, goodName,
            unitDesc, unitPrice, unitCode,
            subTotal, useItem, goodAmou: lot.reduce((acc, cur) => acc + cur.goodAmou, 0)
        }, amount: 0, check: false
    })

export const mapReturnListToGoodReq = (returnList: TGoodFormItem[]): TGoodItemReq[] =>
    returnList.map(({ good: { goodCode, goodAmou, unitCode, unitPrice, subTotal } }) => ({
        goodcode: goodCode,
        goodAmou,
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
