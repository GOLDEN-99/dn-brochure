import { TInviceItemDto, TReceiptItemDto } from "../../../../../service/other-income/base-oi"

export type TMatchingState = {
    invoice: TInviceItemDto | string
    receipt: TReceiptItemDto | string
    matchAmount: string
}
