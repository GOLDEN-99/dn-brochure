import { TDropdownProps } from "../../types"

export const cnReasonRef = ['คลังส่งเกิน', 'คลังส่งขาด', 'คลังส่งผิด', 'สินค้าชำรุด'] as const
export const transferRef = ['โอนคืน', 'ไม่โอนคืน'] as const
export const cnResultRef = ['ลูกค้ารับ', 'ลูกค้าไม่รับ', 'ลูกค้ารับเปลี่ยน'] as const
export const transferOption: TDropdownProps<number>[] = [{ label: 'เลือกการโอน', value: -1 }, ...transferRef.map((label, idx) => ({ value: idx, label }))]