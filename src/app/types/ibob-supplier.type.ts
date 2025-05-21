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

export type TCreateDoorReq = {
    door: TCreateDoorInfo
    time: TCreateTimeSlot[]
}
export type TCreateDoorRes = {}

export type TDoorInfo = { doorId: string } & TCreateDoorInfo

export type TTimeSlotInfo = { id: string, doorId: string } & TCreateTimeSlot

export type TDoorDetail = {
    door: TDoorInfo
    time: TTimeSlotInfo[]
}

