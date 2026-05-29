import { TMaybe } from "../../../shared/types/index.type"

export type TBank = {
    bank: string
    accountNumber: string
    accountName: string
}

export const CN_TYPE = {
    whole: 'whole',
    some: 'some'
} as const

export type TCnType = keyof typeof CN_TYPE

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

type TGoodItemBase = {
    goodCode: string // "9060",
    goodName: string // "GPO Sidegra 50mg 1x4tab (ควบคุม)",
    barCode: string // "111235",
    unitPrice: number,
    unitCode: string // "6",
    unitDesc: string // "กล่อง",
    subTotal: number // 192,
    useItem: number
}

export type TGoodItem = TGoodItemBase & {
    lot: TLotItem[]
}

export type TGoodItemState = TGoodItemBase & {
    orderAmount: number
}


export type TAppLot = { check: boolean, returnAmou: number } & TLotItem

export type TAppGoodItem = { check: boolean, lot: TAppLot[] } & Omit<TGoodItem, 'lot'>

export type TOrderRes = {
    wholeNumb: string // "25035799",
    orderNumb: string // "WO1825516",
    wholeCode: string // "2981",
    goodList: TGoodItem[]
}

export type TGoodItemReq = {
    goodcode: string // "string",
    goodAmou: number
    unitcode: string
    unitprice: number
    subtotal: number
    // lotNumber: TMaybe<string>
    // expiDate: string // "2025-04-04T08:09:04.257Z"
}

export type TPrepenCnApi = {
    cusStat: string //'0' | '1'
    remark: string // note ,
    bankcode: string // 0, === bankCode 
} & TCNQueryParams & Pick<TBaseWhole, 'bankAcName' | 'bankNumb'>

export type TPrependRemark = {
    probOption: TMaybe<string>
    motive: string // TReamrk.remark
    motiveId: string | number // TRemark.id
}

export type TPrependImage = {
    image: string[] // [url1, url2, ...]
}

export type TPrependOrder = {
    totalprice: number
    goodList: TGoodItemReq[]
}

export type TCreateReq = TPrepenCnApi & TPrependRemark & TPrependImage & TPrependOrder & { isWRR: string }


export type TRemarkResult = {
    id: string,
    result: string
}
