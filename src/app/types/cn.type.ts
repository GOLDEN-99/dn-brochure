import { FormControl, FormGroup } from "@angular/forms"
import { cnReasonRef, cnResultRef, transferRef } from "../lib/cn/cnRef"
import { TMapForm, TMaybe } from "./shared.type"

export type TTransfer = typeof transferRef[number]
export type TCnSpecialReason = typeof cnReasonRef[number]
export type TCnResult = typeof cnResultRef[number]
export type TBase = typeof cnReasonRef[0 | 1]
export type TBaseResult = 'ลูกค้ารับ' | 'ลูกค้าไม่รับ'
export type TCnOver = TBaseResult
export type TCnLack = TBaseResult
export type TWrong = typeof cnReasonRef[2]
export type TCnWrong = TBaseResult | 'ลูกค้ารับเปลี่ยน'
export type TBroke = typeof cnReasonRef[3]
export type TCnBroke = Exclude<TCnWrong, 'ลูกค้ารับ'>

export type TBaseForm<T extends TTransfer = typeof transferRef[1]> = {
    wholeCode: string
    wholeName: string
    transfer: T
    ws: string
    note: TMaybe<string>
}

export type TBank = {
    bank: string
    accountNumber: string
    accountName: string
}

export type TWithTranasfer<T extends TTransfer = typeof transferRef[1]> =
    T extends typeof transferRef[0]
    ? { tranferData: TBank } & TBaseForm<T>
    : TBaseForm<T>

export type TExtendForm<T extends TCnSpecialReason = TBase> = {
    cause: T
    status: T extends TWrong ? TCnWrong : T extends TBroke ? TCnBroke : TBaseResult
}

export type TBankForm = FormGroup<TMapForm<TBank>>

export type TCnForm = TMapForm<TBaseForm> & { transferData?: TBankForm }

export type TCnType = 'whole' | 'some'

export interface ICnForm {
    wholeCode: FormControl
    wholeName: FormControl
    transfer: FormControl
    reason: FormControl<TCnSpecialReason | null>
    result: FormControl<TCnResult | null>
    ws: FormControl
    note: FormControl
    transferData?: FormGroup<TMapForm<TBank>>
    cnType: FormControl<TCnType | null>
}
