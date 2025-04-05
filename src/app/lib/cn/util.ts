import { TAppGoodItem, TGoodItem } from "../../types/cn.type";

export const mapCheckCn = ({ lot, ...res }: TGoodItem): TAppGoodItem =>
    ({ ...res, check: false, lot: lot.map(l => ({ ...l, check: false })) })