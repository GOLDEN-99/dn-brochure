import { TCompDetailRes, TCompProduct, TDNComp, THUComp } from "../../types/ibob-supplier.type"
import { TEmplState, TFormState, TIbAppItem } from "./shared.type"

export const toBoolAdapter = (value: unknown) => {
    switch (value) {
        case '1': return true
        default: return false
    }
}

export const toNumberAdapter = (value: unknown) => {
    switch (typeof value) {
        case 'number': return value
        default: return 0
    }
}

export const toIsShipAdapter = (value: unknown) => {
    switch (value) {
        case '1': return 1
        case '2': return 2
        default: return 0
    }
}

export const huCompMapper = (res: THUComp): Partial<TFormState> => {
    const {
        username, userpass, compCode, compName, compName2, compGroupCode, parentCompCode,
        compPhone, compFax, compAddr, compEmail, orderRemark,
        supReturn, supSameLot, supMonthBeforeExp, supMonthAfterExp, supFullBox,
        stkReturn, stkSameLot, stkMonthBeforeExp, stkMonthAfterExp, stkFullBox,
        cashPerDisc, tradePerDisc, dcPerDisc, billIncludeVAT, registered, fixedPrice, shipTo
        , } = res
    return {
        username, userpass, compCode, compName, compName2, compAddr, compEmail, compPhone, compFax, compGroupCode,
        parentCompCode, orderRemark, cashPerDisc, dcPerDisc, tradePerDisc,
        billIncludeVAT: toBoolAdapter(billIncludeVAT),
        registered: toBoolAdapter(registered), fixedPrice: toBoolAdapter(fixedPrice),
        supFullBox: toBoolAdapter(supFullBox), supReturn: toBoolAdapter(supReturn), supSameLot: toBoolAdapter(supSameLot),
        supMonthBeforeExp, supMonthAfterExp,
        stkFullBox: toBoolAdapter(stkFullBox), stkReturn: toBoolAdapter(stkReturn), stkSameLot: toBoolAdapter(stkSameLot),
        stkMonthBeforeExp, stkMonthAfterExp, shipTo
    }
}

export const itemMapper = (item: TCompProduct): TIbAppItem => {
    const {
        goodCode, goodName, goodStat, isShipTo, supFullBox, supReturn, supSameLot, supMonthBeforeExp, supMonthAfterExp,
        stkFullBox, stkReturn, stkSameLot, stkMonthBeforeExp, stkMonthAfterExp,
    } = item
    return {
        goodCode, goodName, barCode: '', goodStat: toBoolAdapter(goodStat), isShipTo: toIsShipAdapter(isShipTo),
        supFullBox: toBoolAdapter(supFullBox), supReturn: toBoolAdapter(supReturn), supSameLot: toBoolAdapter(supSameLot),
        supMonthBeforeExp: toNumberAdapter(supMonthBeforeExp), supMonthAfterExp: toNumberAdapter(supMonthAfterExp),
        stkFullBox: toBoolAdapter(stkFullBox), stkReturn: toBoolAdapter(stkReturn), stkSameLot: toBoolAdapter(stkSameLot),
        stkMonthBeforeExp: toNumberAdapter(stkMonthBeforeExp), stkMonthAfterExp: toNumberAdapter(stkMonthAfterExp)
    }
}

export const dnCompMapper = (res: TDNComp): Partial<TFormState> => {
    const {
        compCode, compName, compName2, compGroupCode, parentCompCode
        , compPhone, compFax, compAddr, compEmail, username, userpass
        , orderRemark, cashPerDisc, tradePerDisc, dcPerDisc, billIncludeVAT,
    } = res
    return {
        username, userpass, compCode, compName, compName2, compAddr, compEmail, compPhone, compFax, compGroupCode,
        parentCompCode, orderRemark, cashPerDisc, dcPerDisc, tradePerDisc,
        billIncludeVAT: toBoolAdapter(billIncludeVAT)
    }
}

export const normalizeComp = ({ dn, hu }: TCompDetailRes): Partial<TFormState> => {
    if (dn === null && hu !== null) {
        return huCompMapper(hu);
    }
    if (dn !== null && hu === null) {
        return dnCompMapper(dn);
    }
    throw new Error("invalid comp response")
}

export const extractSaleName = ({ dn, hu }: TCompDetailRes) => {
    if (dn === null && hu !== null) {
        return hu.saleName
    }
    if (dn !== null && hu === null) {
        return ''
    }
    throw new Error("invalid comp response")
}

export const saleNameToList = (saleName: string): TEmplState[] => saleName.split('|').map(sale => sale.split('/')).map(([ename, ephone, email]) => ({
    emplEmail: email ?? '',
    emplName: ename ?? '',
    emplPhone: ephone ?? ''
}))

export const transformCompInfo = ({ dn, hu, item }: TCompDetailRes) => {
    if (dn === null && hu !== null) {
        const emplList = saleNameToList(hu.saleName)
        const formState = huCompMapper(hu)
        const itemList = item.map(itemMapper)
        return {
            formState, emplList, itemList
        }
    }
    if (dn !== null && hu === null) {
        const emplList: TEmplState[] = []
        const formState = dnCompMapper(dn)
        const itemList = item.map(itemMapper)
        return {
            formState, emplList, itemList
        }
    }
    throw new Error("invalid comp response")
}
