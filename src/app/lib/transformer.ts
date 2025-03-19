import { TColor, TGroupItemList, TItem, TZone } from "../types";

export const transformItemList = (maxItem: number) => (acc: TGroupItemList, cur: TItem, idx: number): TGroupItemList => {

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