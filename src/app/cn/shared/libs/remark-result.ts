import { TMaybe } from "../../../shared/types/index.type"
import { TRemark } from "../types/cn.type"

export const RESULT_TYPE = {
    none: 'none',
    notChange: 'notChange',
    all: 'all',
    notAccept: 'notAccept',
    mustReject: 'mustReject'
} as const

export type TResultType = keyof typeof RESULT_TYPE

export const mapRemarkToResult = (remark: TMaybe<TRemark>): TResultType => {
    if (remark === null) return RESULT_TYPE.none
    switch (remark.id) {
        case '3': return RESULT_TYPE.notChange
        case '4': return RESULT_TYPE.notChange
        case '5': return RESULT_TYPE.all
        // group 1
        case '34': return RESULT_TYPE.notChange
        case '36': return RESULT_TYPE.notChange
        // group 2
        case '37': return RESULT_TYPE.mustReject
        // group 3
        case '12': return RESULT_TYPE.notAccept
        case '42': return RESULT_TYPE.notAccept
        case '44': return RESULT_TYPE.notAccept
        // group 4
        case '47': return RESULT_TYPE.mustReject
        case '48': return RESULT_TYPE.mustReject

        default: return RESULT_TYPE.none
    }
} 