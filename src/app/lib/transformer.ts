import { TColor, TGroupItemList, TItem, TZone } from "../types";

export const transformItemList = (acc: TGroupItemList, cur: TItem, idx: number): TGroupItemList => {
    if (idx % 6 === 0) {
        return [...acc, [cur]]
    }
    const len = acc.length
    if (len === 0) {
        return [[cur]]
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