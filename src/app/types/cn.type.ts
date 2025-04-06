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

export type TCnType = TMaybe<'whole' | 'some'>

export interface ICnForm {
    wholeCode: FormControl
    wholeName: FormControl
    transfer: FormControl<TTransfer | null>
    transferData?: FormGroup<TMapForm<TBank>>
    ws: FormControl
    note: FormControl
    reason: FormControl<TCnSpecialReason | null>
    result?: FormControl<TCnResult | null>
    cnType?: FormControl<TCnType | null>
}


export type TCNQueryParams = {
    saleCode: string
    wholeCode: string //"2981",
    wholeNumb: string // "25035799",
}

type TBaseWhole = {
    wholeName: string // "ร้านยาวีแคร์ จ.นครปฐม",
    bankNumb: string // "8830398004",
    bankCode: string // "3",
    bankAcName: string // " คุณธัญภรณ์ กิจทวี ",
}

export type TWholeItem = {
    code: string // "KTB",
    name: string // "กรุงไทย",
    wholeDate: string // "03/12/2025 00:00:00"
} & TBaseWhole & Omit<TCNQueryParams, 'saleCode'>

export type TReamrk = {
    id: string //1
    remark: string
}

export type TLotItem = {
    goodCode: string //"13628",
    lotNumber: TMaybe<string>  //null,
    expiDate: string // "0001-01-01T00:00:00",
    goodAmou: number //
}

export type TGoodItem = {
    goodCode: string // "9060",
    goodName: string // "GPO Sidegra 50mg 1x4tab (ควบคุม)",
    barCode: string // "111235",
    unitPrice: number,
    unitCode: string // "6",
    unitDesc: string // "กล่อง",
    subTotal: number // 192,
    lot: TLotItem[]
}

export type TAppLot = { check: boolean } & TLotItem

export type TAppGoodItem = { check: boolean, lot: TAppLot[] } & Omit<TGoodItem, 'lot'>

export type TOrderRes = {
    wholeNumb: string // "25035799",
    orderNumb: string // "WO1825516",
    wholeCode: string // "2981",
    goodList: TGoodItem[]
}

export type TGoodItemReq = {
    goodcode: string // "string",
    lotNumber: string
    goodAmou: number
    unitcode: string
    unitprice: number
    subtotal: number
    expiDate: string // "2025-04-04T08:09:04.257Z"
}

export type TCreateReq = {
    cusStat: string
    bankcode: string | number // 0, === bankCode
    motive: string // TReamrk.remark
    motiveId: string | number // TRemark.id
    remark: string // note ,
    totalprice: number
    image: string[] // [url1, url2, ...]
    goodList: TGoodItemReq[]
} & TCNQueryParams & Pick<TBaseWhole, 'bankAcName' | 'bankNumb'>