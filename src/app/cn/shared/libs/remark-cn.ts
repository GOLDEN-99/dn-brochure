import { TMaybe } from "../../../shared/types/index.type";
import { TRemark } from "../types/cn.type";


// '19' = ผ่อนชำระไม่ถูกต้อง, '30'/'31' = ข้อมูลการโอนเงินไม่ถูกต้อง
// ไม่มีสินค้าให้คืน จึงไม่ต้องเข้า flow CN
// TODO: รอ business user ยืนยันว่า remark ใหม่ต้องเพิ่มในลิสต์นี้ด้วยหรือไม่
//   '37' สินค้าชำรุดจากขนส่ง (ลูกค้ายกเลิกทั้งบิล)
//   '47' ลูกค้าไม่รับ (สินค้าชำรุด)
//   '48' ลูกค้าไม่รับ (สินค้าไม่เป็นแพ็ค)
// ทั้งสามรายการมีสินค้าส่งคืนจริง ตามเกณฑ์เดิมจึงยังไม่ควรอยู่ในลิสต์นี้
// ดู docs/remark-category-filter.md
export const mapRemarkToShowCN = (remark: TMaybe<TRemark>) => {
    if (remark === null) return true
    return !['0', '19', '30', '31'].includes(remark.id)
}