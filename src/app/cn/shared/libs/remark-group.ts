import { TRemark, TRemarkCategory } from "../types/cn.type"

// id ตรงกับ remarkGroup ที่ GET /GetCNRemark ส่งกลับมา ('1'-'7')
export const REMARK_CATEGORIES: TRemarkCategory[] = [
    { id: '1', label: 'เกิดจากคลัง' },
    { id: '2', label: 'เกิดจากสินค้า' },
    { id: '3', label: 'สินค้าชำรุด' },
    { id: '4', label: 'เกิดจากลูกค้า' },
    { id: '5', label: 'เกิดจากเทเล' },
    { id: '6', label: 'เกิดจากเซล' },
    { id: '7', label: 'โอนเงินล่วงหน้า' },
]

// ค่าเริ่มต้นของตัวกรอง — dropdown ไม่มีตัวเลือก null ให้เลือก
export const DEFAULT_REMARK_CATEGORY: TRemarkCategory = REMARK_CATEGORIES[0]

// prod ยังไม่ส่ง remarkGroup มา ถ้าไม่มีเลยให้ซ่อนตัวกรองแล้วแสดงสาเหตุทั้งหมดแทน
export const hasRemarkGroup = (remarks: TRemark[]) =>
    remarks.some(({ remarkGroup }) => !!remarkGroup)

// ไม่กรองเมื่อ api ยังไม่ส่ง remarkGroup มา ไม่งั้นจะได้ลิสต์ว่างทั้งหมด
export const filterRemarkByGroup = (cate: TRemarkCategory | null) => (remarks: TRemark[]) =>
    cate === null || !hasRemarkGroup(remarks)
        ? remarks
        : remarks.filter(({ remarkGroup }) => remarkGroup === cate.id)

// ใช้ตัดสินว่าสาเหตุที่เลือกไว้ยังอยู่ในหมวดปัจจุบันไหม
// ถ้า api ไม่ส่ง remarkGroup มา ให้ถือว่ายังอยู่เสมอ ไม่งั้นจะโดนล้างทิ้งบน prod
export const isInGroup = (remark: TRemark | null, cate: TRemarkCategory | null) =>
    remark === null || cate === null || !remark.remarkGroup || remark.remarkGroup === cate.id
