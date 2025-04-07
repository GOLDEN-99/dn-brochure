import { WritableSignal } from "@angular/core"
import { TAppGoodItem, TAppLot, TGoodItemReq, TLotItem } from "../../../types/cn.type"
import { TMaybe } from "../../../types"

export const mapSelectedLot: TLotMapper = ({ subTotal, unitPrice, unitCode }) =>
    (lots) =>
        lots.flatMap(
            ({ check, lotNumber, goodAmou, goodCode, expiDate }) =>
                check
                    ? [{ lotNumber, goodAmou, goodcode: goodCode, expiDate, unitprice: unitPrice, unitcode: unitCode, subtotal: subTotal }]
                    : []
        )

export const mapWholeLot: TLotMapper = ({ subTotal, unitPrice, unitCode }) =>
    (lots) =>
        lots.map(
            ({ lotNumber, goodAmou, goodCode, expiDate }) =>
                ({ lotNumber, goodAmou, goodcode: goodCode, expiDate, unitprice: unitPrice, unitcode: unitCode, subtotal: subTotal })
        )

export type TRef = Pick<TAppGoodItem, 'subTotal' | 'unitPrice' | 'unitCode'>
export type TLotMapper = (ref: TRef) => (lots: TAppLot[]) => TGoodItemReq[]

export const checkLot = ({ lotNumber, expiDate }: TEditField) => {
    if (!lotNumber) {
        return ({ expiDate: cur }: TEditField) => cur === expiDate
    }
    return ({ lotNumber: cur }: TEditField) => cur === lotNumber
}

export const baseCheckLot = (sig: WritableSignal<TAppGoodItem[]>) =>
    ({ goodCode: curGoodCode, ...ref }: TCurrentRef) => {
        const isSameLot = checkLot(ref)
        return (incoming: TEditableField) => {
            sig.update(
                prev => prev.map(
                    (good) => good.goodCode !== curGoodCode
                        ? good
                        : ({
                            ...good,
                            lot: good.lot
                                .map(
                                    ({ lotNumber, expiDate, goodAmou, ...res }) =>
                                        isSameLot({ lotNumber, expiDate })
                                            ? { lotNumber, expiDate, goodAmou, ...res, ...incoming }
                                            : { lotNumber, expiDate, goodAmou, ...res }
                                )
                        })
                )
            )
        }
    }


export type TEditField = Pick<TLotItem, 'lotNumber' | 'expiDate'>

export type TEditableField = Partial<Pick<TAppLot, 'returnAmou' | 'check'>>

interface TCurrentRef {
    lotNumber: TMaybe<string>
    expiDate: string //iso
    goodCode: string
}
