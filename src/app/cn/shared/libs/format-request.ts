import { TStepOne } from "../types/cn.type";
import { mapRemarkToResult } from "./remark-result";

export const mapFormToApiRequest = (form: TStepOne) => {
    const { remark, remarkOpt, resultAll, resultNotAccept, resultNotChange, cusStat } = form;
    if (remarkOpt === null) return null
    const { id: motiveId, remark: motive } = remarkOpt;
    const remarkKey = mapRemarkToResult(remarkOpt)
    const probOption = remarkKey === 'all' ? resultAll?.id ?? '-1' : remarkKey === 'notAccept' ? resultNotAccept?.id ?? '-1' : remarkKey === 'notChange' ? resultNotChange?.id ?? '-1' : '-1'
    return {
        remark, cusStat,
        motiveId, motive, probOption
    }
}
