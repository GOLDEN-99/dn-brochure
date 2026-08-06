import { TMaybe } from "../../../shared/types/index.type";
import { TRemarkResult, TStepOne } from "../types/cn.type";
import { mapRemarkToResult, TResultType } from "./remark-result";

export const mapFormToApiRequest = (form: TStepOne) => {
    const { remark, remarkOpt, resultAll, resultNotAccept, resultNotChange, resultMustReject, cusStat } = form;
    if (remarkOpt === null) return null
    const { id: motiveId, remark: motive } = remarkOpt;
    const resultByType: Record<TResultType, TMaybe<TRemarkResult>> = {
        none: null,
        all: resultAll,
        notAccept: resultNotAccept,
        notChange: resultNotChange,
        mustReject: resultMustReject,
    }
    const probOption = resultByType[mapRemarkToResult(remarkOpt)]?.id ?? '-1'
    return {
        remark, cusStat,
        motiveId, motive, probOption
    }
}
