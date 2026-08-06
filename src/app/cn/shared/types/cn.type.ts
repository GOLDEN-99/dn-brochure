import { TMaybe } from "../../../shared/types/index.type"
import { TCNRouteParam } from "../libs/parse-cn-param"

export type CnLoadErrorReason = 'order-not-found' | 'whole-item-not-found' | 'api-error' | 'unknown'

export class CnLoadError extends Error {
    constructor(
        public readonly reason: CnLoadErrorReason,
        message: string,
        public readonly request: TCNRouteParam,
    ) {
        super(message)
        this.name = 'CnLoadError'
    }
}

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

export type TRemark = {
    id: string //1
    remark: string
}

export type TLotItem = {
    goodCode: string //"13628",
    lotNumber: TMaybe<string>  //null,
    expiDate: string // "0001-01-01T00:00:00",
    goodAmou: number //
}

export type TGoodItemBase = {
    goodCode: string // "9060",
    goodName: string // "GPO Sidegra 50mg 1x4tab (ควบคุม)",
    barCode: string // "111235",
    unitPrice: number,
    unitCode: string // "6",
    unitDesc: string // "กล่อง",
    subTotal: number // 192,
    useItem: number
    goodAmou: number // as order amount
}

export type TGoodWithLot = Omit<TGoodItemBase, 'goodAmou'> & {
    lot: TLotItem[]
}

export type TGoodItemState = TGoodItemBase & {
    orderAmount: number
}



export type TOrderRes = {
    wholeNumb: string // "25035799",
    orderNumb: string // "WO1825516",
    wholeCode: string // "2981",
    goodList: TGoodItemBase[]
}

export type TGoodItemReq = {
    goodcode: string // "string",
    goodAmou: number
    unitcode: string
    unitprice: number
    subtotal: number
}

export type TRemarkResult = {
    id: string,
    result: string
}

export interface TCreateReq {
    // identity / billing
    isWRR: string
    cusStat: string
    bankcode: string
    bankAcName: string
    bankNumb: string
    saleCode: string
    wholeCode: string
    wholeNumb: string
    // reason
    motive: string           // TRemark.remark
    motiveId: string | number // TRemark.id
    probOption: TMaybe<string>
    // note
    remark: string
    // order
    totalprice: number
    goodList: TGoodItemReq[]
    // attachments
    image: string[]
}

// ─── Form State Types ─────────────────────────────────────────────────────────

export type TReadonlyForm = {
    isWRR: string
    bankAcName: string
    bankCode: string
    bankNumb: string
    code: string
    name: string
    wholeCode: string
    wholeDate: string
    wholeName: string
    wholeNumb: string
    saleCode: string
}

export type TStepOne = {
    remarkOpt: TMaybe<TRemark>
    resultNotChange: TMaybe<TRemarkResult>
    resultAll: TMaybe<TRemarkResult>
    resultNotAccept: TMaybe<TRemarkResult>
    resultMustReject: TMaybe<TRemarkResult>
    cnType: TMaybe<TCnType>
    remark: string
    cnCount: number
    cusStat: string
}

export type TGoodFormItem = {
    good: TGoodItemBase
    amount: number
    check: boolean
}

export type TCreateCancelForm = {
    metadata: TReadonlyForm
    stepOne: TStepOne
    image: string[]
    returnList: Array<TGoodFormItem>
}
