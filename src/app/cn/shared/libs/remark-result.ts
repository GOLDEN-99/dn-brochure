import { TMaybe } from "../../../shared/types/index.type"
import { TRemark } from "../types/cn.type"

export const RESULT_TYPE = {
    none: 'none',
    notChange: 'notChange',
    all: 'all',
    notAccept: 'notAccept',
} as const

export type TResultType = keyof typeof RESULT_TYPE

export const mapRemarkToResult = (remark: TMaybe<TRemark>): TResultType => {
    if (remark === null) return RESULT_TYPE.none
    switch (remark.id) {
        case '3': return RESULT_TYPE.notChange
        case '4': return RESULT_TYPE.notChange
        case '5': return RESULT_TYPE.all
        case '12': return RESULT_TYPE.notAccept
        default: return RESULT_TYPE.none
    }
} 