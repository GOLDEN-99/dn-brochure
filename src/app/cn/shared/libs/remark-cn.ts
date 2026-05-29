import { TMaybe } from "../../../shared/types/index.type";
import { TReamrk } from "../types/cn.type";


export const mapRemarkToShowCN = (remark: TMaybe<TReamrk>) => {
    if (remark === null) return true
    return !['0', '19', '30', '31'].includes(remark.id)
}