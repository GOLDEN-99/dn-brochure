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

export type TDoor = {
    doorId: string
    warehouseId: string
    name: string
    note: string
    timeUse: number
    multiple: string
}

export type TDoorMap = {
    [key in string]?: TDoor[];
}

export type TOrder = {
    orderNumb: string
    orderDate: string
}

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

export type TCreateReserveReq = {
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
}

export type TCreateReserveRes = {}