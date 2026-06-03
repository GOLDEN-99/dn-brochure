import { TColor, TZone } from "../utils/param-schema"

export const transformItemList = (maxItem: number) => <T>(acc: Array<Array<T>>, cur: T, idx: number): Array<Array<T>> => {

    const len = acc.length
    if (len === 1 && idx === 0) {
        return [[cur]]
    }
    if (idx % maxItem === 0) {
        return [...acc, [cur]]
    }
    const lastGroup = acc[len - 1]
    return [...acc.slice(0, len - 1), [...lastGroup, cur]]
}

export const zoneToColor = (zone: TZone): TColor => {
    switch (zone) {
        case "BKK": return 'purple'
        case "UPC": return 'green'
    }
}