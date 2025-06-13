export type TLoginReq = {
    user: string
    password: string
}

export type TComp = {
    compCode: string
    compName: string
    compName2: string
    compPhone: string
    saleName: string
    compEmail: string
}

export type TModifiedComp = { shipto: string } & TComp

export type TWarehouse = {
    id: string
    name: string
}

export type TDoor = {
    doorId: string
    warehouseId: string
    name: string
    note: string
    timeUse: number
    multiple: string
    intendant: string | null
}

export type TAppDoor = {
    check: boolean
} & TDoor

export type TDoorMap = {
    [key in string]?: TDoor[];
}

export type TOrder = {
    orderNumb: string
    orderDate: string
}

export type TAppOrder = {
    box: number
    check: boolean
} & TOrder

export type TLoginRes = {
    comp: TComp
    door: TDoor[]
    shipto: string
    expireIn: number
    token: string
    order: TOrder[]
}

export type TCompListRes = {}

export type TIbObOrder = { orderNumb: string, box: number }

export type TCreateReservationReq = {
    doorId: string
    reservationDate: string // iso
    reservationTime: string // '18:00'?
    companyName: string
    contactName: string
    phoneNumber: string
    email: string
    truckType: string
    truckLicensePlate: string
    note: string
    compCode: string
    order: TIbObOrder[]
    shipto: string
}

export type TEditableResavation = Pick<TCreateReservationReq, 'doorId' | 'reservationDate' | 'reservationTime' | 'note'>

export type TCreateReserveRes = {}

export type TTimeSlot = {
    time: string
    isReserved: boolean
}

export type TGetIbObRes = {
    date: string
    doorId: string
    slots: TTimeSlot[]
}

export type TWeeklyReq = {
    startDate: string //iso
    endDate: string //iso
    doors: string[]
}

export type TSlotReady = {
    time: string
    status: number
}

export type TWeeklyRes = {
    date: string //iso
    times: TSlotReady[]
}

export type TAppWeeklyItem = {
    date: string
} & TSlotReady

export type TAppWeeklyList = TAppWeeklyItem[][]

export type TDailyReq = {
    date: string
    warehouseId: string
}

export type TDailyItem = { door: string, status: number, times: TSlotReady[] }

export type TDailyRes = {
    date: string
    doors: TDailyItem[]
}

export type TDailyStatItem = Pick<TDailyItem, 'door' | 'status'>

export type TDailyStatRes = {
    warehouseId: string
    date: string
    doors: TDailyItem[]
}

export type TAllDayDetailReq = {
    door: string //doorId
} & TDailyReq

export type TAllDayDetailRes = {
    reservationDate: string
    reservationTime: string
    companyName: string | null
    compCode: string | null
}

export type TMonthlyReq = {
    month: number
    year: number
    door: string[]
}

export type TMonthlyRes = {
    date: string
    status: number
}

export type TCreateDoorInfo = {
    mail: string
    whname: string
    doorname: string
} & Pick<TDoor, 'warehouseId' | 'note' | 'timeUse' | 'intendant' | 'multiple'>

export type TAvalTimeSlot = {
    dayId: number
    dayName: string
    startTime: string
    endTime: string
    isAvailable: true
}

export type TUnavalTimeSlot = {
    dayId: number
    dayName: string
    isAvailable: false
}

export type TCreateTimeSlot = {
    dayId: number
    dayName: string
    startTime: string | null
    endTime: string | null
    isAvailable: boolean
}

export type TEditTimeSlot = { doorId: number, id: number } & TCreateTimeSlot

export type TCreateDoorReq = {
    door: TCreateDoorInfo
    time: TCreateTimeSlot[]
}

export type TCreateDoorRes = {}

export type TDoorInfo = { doorId: string } & TCreateDoorInfo

export type TTimeSlotInfo = { id: number, doorId: number } & TCreateTimeSlot

export type TDoorDetail = {
    door: TDoorInfo
    time: TTimeSlotInfo[]
}

export type TGeneratedCompCode = {
    compCode: string
    dnCompCode: string
}

export type TCondiSup = {
    supReturn: string
    supFullBox: string
    supSameLot: string
    supMonthBeforeExp: number
    supMonthAfterExp: number
}

export type TCondiBranch = {
    stkReturn: string
    stkFullBox: string
    stkSameLot: string
    stkMonthBeforeExp: number
    stkMonthAfterExp: number
}

export type TcondiReq = TCondiSup & TCondiBranch //10

type TCompAuth = {
    username: string,
    userpass: string
} //2

type TCompBaseInfo = {
    compCode: string,
    compName: string,
    compAddr: string,
    compName2: string,
    compFax: string,
    compStat: string,
    orderRemark: string,
    orderFileType: string,
    compGroupCode: string,
    parentCompCode: string,
    billIncludeVAT: string,
} //11

type TCompDiscount = {
    paymentTerms: 0,
    cashPerDisc: 0,
    tradePerDisc: 0,
    dcPerDisc: 0,
} //4

type TCompDb = {
    timeStamp: string,
    updateDate: string,
    sapUpdateDate: string,
} //3

export type THUComp = {
    shipTo: string,
    compPhone: string,
    compEmail: string,
    saleName: string,

    fixedPrice: string,
    registered: string,
} & TCompAuth & TcondiReq & TCompDiscount & TCompBaseInfo & TCompDb

export type TDNComp = {
    compEmail: string,
    compPhone: string,
} & TCompAuth & TCompDiscount & TCompBaseInfo & TCompDb

type TNullable<T extends Record<string, unknown>> = {
    [key in keyof T]: T[key] | null
}

export type TCompProduct = {
    goodCode: string
    goodName: string
    goodStat: string // '0' | '1'
    isShipTo: string | null //  '0' | '1' | null
} & TNullable<TcondiReq>

export type TCreateCompInfoReq = {
    hu: THUComp
    dn: TDNComp
}

export type TCompDetailRes = {
    hu: THUComp | null
    dn: TDNComp | null
    item: TCompProduct[]
}
