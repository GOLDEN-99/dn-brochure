export type TFormState = {
    compCode: string;
    compName: string;
    compAddr: string;
    compPhone: string;
    compFax: string;
    compEmail: string;
    compGroupCode: string;
    compGroupDesc: string
    orderRemark: string;
    orderFileType: string | null; // pdf ???
    compName2: string;
    compStat: string; // '1'
    paymentTerms: number;
    timeStamp: string | null; // ISO date string
    updateDate: string | null; // ISO date string
    sapUpdateDate: string | null; // ISO date string
    parentCompCode: string;
    parentCompName: string
    billIncludeVAT: boolean;
    cashPerDisc: number;
    tradePerDisc: number;
    dcPerDisc: number;
    username: string;
    userpass: string;
    // saleName: string;
    shipTo: string;
    fixedPrice: boolean;
    registered: boolean;
    supReturn: boolean;
    stkReturn: boolean;
    supFullBox: boolean;
    stkFullBox: boolean;
    supSameLot: boolean;
    stkSameLot: boolean;
    supMonthBeforeExp: number;
    stkMonthBeforeExp: number;
    supMonthAfterExp: number;
    stkMonthAfterExp: number;
}

export type TEmplState = {
    emplName: string
    emplPhone: string
    emplEmail: string
}


export type TIbAppItem = {
    goodCode: string;
    goodName: string;
    barCode: string
    goodStat: boolean;
    isShipTo: number;
    supReturn: boolean;
    supMonthBeforeExp: number;
    supMonthAfterExp: number;
    supFullBox: boolean;
    supSameLot: boolean;
    stkReturn: boolean;
    stkFullBox: boolean;
    stkSameLot: boolean;
    stkMonthBeforeExp: number;
    stkMonthAfterExp: number;
}

export type TBaseSupplier = {
    compCode: string;
    compName: string;
    compAddr: string;
    compPhone: string;
    compFax: string;
    compEmail: string;
    compGroupCode: string;
    orderRemark: string;
    orderFileType: string | null; // pdf ???
    compName2: string;
    compStat: string; // '1'
    paymentTerms: number;
    timeStamp: string | null; // ISO date string
    updateDate: string | null; // ISO date string
    sapUpdateDate: string | null; // ISO date string
    parentCompCode: string;
    billIncludeVAT: string;
    cashPerDisc: number;
    tradePerDisc: number;
    dcPerDisc: number;
    username: string;
    userpass: string;
}

export type THUCreate = {
    saleName: string;
    shipTo: string;
    fixedPrice: string;
    registered: string;
    supReturn: string;
    stkReturn: string;
    supFullBox: string;
    stkFullBox: string;
    supSameLot: string;
    stkSameLot: string;
    supMonthBeforeExp: number;
    stkMonthBeforeExp: number;
    supMonthAfterExp: number;
    stkMonthAfterExp: number;
} & TBaseSupplier

export type TDNCreate = TBaseSupplier

export type TItem = {
    goodCode: string;
    goodName: string;
    goodStat: string;
    isShipTo: string;
    supReturn: string;
    supMonthBeforeExp: string;
    supMonthAfterExp: string;
    supFullBox: string;
    supSameLot: string;
    stkReturn: string;
    stkFullBox: string;
    stkSameLot: string;
    stkMonthBeforeExp: string;
    stkMonthAfterExp: string;
}

export type TCreateSupplierReq = {
    hu: THUCreate | null
    dn: TDNCreate | null
    item: TItem[]
}

export interface IComp {
    compType: string
}