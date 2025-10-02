import { TSingleReservation } from "../../../service/ibob/ibob-query-reservation.service"
import { TMaybe } from "../../../types"
import { TAppDoorProp, TAppOrder } from "../../../types/ibob-supplier.type"

const createSelector = <T, K>({ mapper, fallback }: TSelectorSetup<T, K>) => (nullableData: TMaybe<T>) => {
    const cur = nullableData
    if (cur === null) return fallback
    return mapper(cur)
}

const driverHandler: TSelectorSetup<TSingleReservation, TDriverData> = {
    mapper: (d) => {
        const { contactName, phoneNumber, note, truckLicensePlate, truckType } = d
        return { contactName, phoneNumber, note, truckLicensePlate, truckType }
    },
    fallback: {
        contactName: "",
        phoneNumber: "",
        truckLicensePlate: "",
        truckType: "",
        note: ""
    }
}

const compHandler: TSelectorSetup<TSingleReservation, TCompData> = {
    mapper: (d) => {
        const { companyName, compCode, compEmail, compPhone, shipTo } = d
        return { compName: companyName, compCode, compEmail, compPhone, compType: shipTo }
    },
    fallback: {
        compName: '', compCode: '', compPhone: '', compEmail: '', compType: ''
    }
}

const slotHandler: TSelectorSetup<TSingleReservation, string[]> = {
    mapper: (d) => d.slots,
    fallback: []
}

const doorHandler: TSelectorSetup<TSingleReservation, TMaybe<TAppDoorProp>> = {
    mapper: (d) => ({ ...d.activeDoor, doorId: String(d.activeDoor.doorId) }),
    fallback: null
}

const orderHandler: TSelectorSetup<TSingleReservation, Array<Omit<TAppOrder, "orderDate">>> = {
    mapper: (d) => d.orderList.map(o => ({ ...o, check: true })),
    fallback: []
}

const dateHandler: TSelectorSetup<TSingleReservation, string> = {
    mapper: (d) => d.reservationDate,
    fallback: (new Date()).toISOString().split('T')[0]
}

const timeslotParamHandler: TSelectorSetup<TSingleReservation, [string, string]> = {
    mapper: (d) => [String(d.activeDoor.doorId), d.reservationDate],
    fallback: ["", ""]
}

const shortCompHandler: TSelectorSetup<TSingleReservation, Pick<TCompData, "compCode" | "compType">> = {
    mapper: ({ compCode, shipTo }) => ({ compCode, compType: shipTo }),
    fallback: { compCode: '', compType: '' }
}

export const selectDriver = createSelector(driverHandler)
export const selectComp = createSelector(compHandler)
export const selectSlot = createSelector(slotHandler)
export const selectActiveDoor = createSelector(doorHandler)
export const selectOrder = createSelector(orderHandler)
export const selectIsoDate = createSelector(dateHandler)
export const selectTimeslotParams = createSelector(timeslotParamHandler)
export const selectShortComp = createSelector(shortCompHandler)


type TSelectorSetup<T, K> = {
    mapper: (value: T) => K
    fallback: K
}

type TCompData = {
    compName: string
    compCode: string
    compPhone: string
    compEmail: string
    compType: string
}


export type TDriverData = {
    contactName: string
    phoneNumber: string
    truckLicensePlate: string
    truckType: string
    note: string
}
