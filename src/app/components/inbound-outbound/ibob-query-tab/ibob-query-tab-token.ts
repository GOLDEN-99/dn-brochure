import { InjectionToken } from "@angular/core"

export interface ICustomFieldSearch {
    opt: Map<number, { label: string, field: string }>
}

export const CUSTOM_FIELD_SEARCH_TOKEN = new InjectionToken<ICustomFieldSearch>('custom-field-search')

export const IBOB_RESERVATION_SEARCH: ICustomFieldSearch = {
    opt: new Map([[1, { label: 'ชื่อซัพพลายเออร์', field: 'supplier' }], [2, { label: 'เลข PO', field: 'po' }]])
}

export const IBOB_SUPPLIER_COMP_SEARCH: ICustomFieldSearch = {
    opt: new Map([[1, { label: 'ชื่อซัพพลายเออร์', field: 'compName' }], [2, { label: 'รหัสซัพพลายเออร์', field: 'compCode' }]])
}

export const OTHER_INCOME_SEARCH: ICustomFieldSearch = {
    opt: new Map([
        [1, { label: 'รหัสซัพพลายเออร์', field: 'compCode' }],
        [2, { label: 'รหัสสินค้า', field: 'goodCode' }]
    ])
}