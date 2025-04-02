export type TPriceTier = {
    standard: number
    silver: number
    gold: number
}

export type TShopRecord = {
    id: number
    shopName: string
}

export type TPromotionType = 'Monthly' | 'SP' | 'Hot'

export type TZone = 'BKK' | 'UPC'

export type TWhole = 'Normal' | 'Dental' | 'Clinic'

export type TPrice = {
    price: number
    priceGold: number
    priceSilver: number
    priceStandard: number
}

export type TItem = {
    goodCode: string
    goodName: string
    barCode: string
    price: TPrice
}

export type TNewCustomer = 'OC' | 'NC' | null

export type TItemList = {
    fromDate?: string | null
    toDate?: string | null
    wholeName: string
    wholeType: TWhole
    zone: TZone
    promotionType: TPromotionType
    isNewCustomer: TNewCustomer
    promotion: TItem[]
}

export type TGroupItemList = Array<TItem[]>

export type TCardProps = {
    isFlag: boolean
} & TItem


export type TMarketingParams = {
    wholeType: TWhole
    isNewCustomer: boolean
    isBkk: boolean
    promoType: TPromotionType
    token: string
    idPromotion: string
}
export type TBorchureHead = Omit<TItemList, 'promotion'>