import { InjectionToken } from "@angular/core"
import { IOtherIncomePageToke } from "../types"
import { ISupplierList } from "../service/supplier/supplier.token"

export const SUPPLIER_TOKEN = new InjectionToken<ISupplierList>('supplier_token')

export const OTHER_INCOME_PAGE_TOKEN = new InjectionToken<IOtherIncomePageToke>('other_income_page_token')
