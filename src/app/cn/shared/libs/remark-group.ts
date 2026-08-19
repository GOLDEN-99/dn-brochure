import { TRemark } from "../types/cn.type"

export type TRemarkCategory = {
    id: string,
    label: string,
}

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

// prod ยังไม่ส่ง remarkGroup มา ถ้าไม่มีเลยให้ซ่อนตัวกรองแล้วแสดงสาเหตุทั้งหมดแทน
export const hasRemarkGroup = (remarks: TRemark[]) =>
    remarks.some(({ remarkGroup }) => !!remarkGroup)

export const filterRemarkByGroup = (cate: TRemarkCategory | null) => (remarks: TRemark[]) =>
    cate === null ? remarks : remarks.filter(({ remarkGroup }) => remarkGroup === cate.id)

export const isInGroup = (remark: TRemark | null, cate: TRemarkCategory | null) =>
    remark === null || cate === null || remark.remarkGroup === cate.id
