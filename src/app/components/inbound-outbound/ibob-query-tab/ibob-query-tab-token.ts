import { InjectionToken } from "@angular/core"

export interface ICustomFieldSearch<T = string> {
    opt: Map<number, { label: string, field: T }>
}

export const CUSTOM_FIELD_SEARCH_TOKEN = new InjectionToken<ICustomFieldSearch>('custom-field-search')

export const IBOB_RESERVATION_SEARCH: ICustomFieldSearch<string> = {
    opt: new Map([[1, { label: 'ชื่อซัพพลายเออร์', field: 'supplier' }], [2, { label: 'เลข PO', field: 'po' }]])
}

export const IBOB_SUPPLIER_COMP_SEARCH: ICustomFieldSearch<string> = {
    opt: new Map([[1, { label: 'ชื่อซัพพลายเออร์', field: 'compName' }], [2, { label: 'รหัสซัพพลายเออร์', field: 'compCode' }]])
}

export const OTHER_INCOME_NL_SEARCH: ICustomFieldSearch<number> = {
    opt: new Map([
        [1, { label: 'รหัสซัพพลายเออร์ DN', field: 1 }],
        [2, { label: 'รหัสซัพพลายเออร์ HU', field: 2 }],
        [3, { label: 'รหัสสินค้า', field: 3 }]
    ])
}

export const OTHER_INCOME_L_SEARCH: ICustomFieldSearch<number> = {
    opt: new Map([
        [1, { label: 'รหัสซัพพลายเออร์ DN', field: 1 }],
        [2, { label: 'รหัสซัพพลายเออร์ HU', field: 2 }],
    ])
}