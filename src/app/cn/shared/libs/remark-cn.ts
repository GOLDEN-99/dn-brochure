import { TMaybe } from "../../../shared/types/index.type";
import { TRemark } from "../types/cn.type";


// '19' = ผ่อนชำระไม่ถูกต้อง, '30'/'31' = ข้อมูลการโอนเงินไม่ถูกต้อง
// ไม่มีสินค้าให้คืน จึงไม่ต้องเข้า flow CN
// TODO: รอ business user ยืนยันว่ากลุ่ม remark ใหม่ ('37', '47', '48') ต้องเพิ่มในลิสต์นี้ด้วยหรือไม่
export const mapRemarkToShowCN = (remark: TMaybe<TRemark>) => {
    if (remark === null) return true
    return !['0', '19', '30', '31'].includes(remark.id)
}