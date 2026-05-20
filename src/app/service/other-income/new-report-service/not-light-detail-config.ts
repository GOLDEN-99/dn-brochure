import { customFormatDate, formatLocalNumber } from "../../../lib/formatter";

export type TNotLightDetailResponse = {
    id: number;
    displayName: string;
    compCode: string;
    compType: string;
    compName: string;
    startDate: string;
    endDate: string;
    stepType: number;
    capAmount: number;
    isDc: boolean;
    isRebate: boolean;
    isInce: boolean;
    isComp: boolean;
    incVat: boolean;
    stepList: { min: number; max: number | null; rate: number }[];
    orderHistory: TNotLightOrderHistory[];
}

export type TNotLightOrderHistory = {
    headId: number;
    monthIndex: string;
    ourAmount: number;
    supplierAmount: number;
    ourIncome: number;
    supplierIncome: number;
}

export const NOT_LIGHT_SHEET_NAME = "ประมาณการเปรียบเทียบ"

type TContractCol = { header: string; valueMapper: (v: TNotLightDetailResponse) => unknown }
type TOrderCol = { header: string; valueMapper: (v: TNotLightOrderHistory) => unknown }

const mapStepType = (stepType: number): string => {
    switch (stepType) {
        case 1: return 'บาทแรก'
        case 2: return 'step บาทแรก'
        case 3: return 'ขั้นบันได'
        default: return 'มีข้อผิดพลาด'
    }
}

const mapStepList = (stepList: { min: number; max: number | null; rate: number }[]): string =>
    stepList.map(s => `ตั้งแต่ ${formatLocalNumber(s.min)} คิดรายได้ ${s.rate}%`).join('\n')

const mapNotLightDiscountCriteria = (v: TNotLightDetailResponse): string => [
    `${v.isDc ? 'หัก' : 'ไม่หัก'} ส่วนลด dc`,
    `${v.isRebate ? 'หัก' : 'ไม่หัก'} ส่วนลด rebate`,
    `${v.isInce ? 'หัก' : 'ไม่หัก'} ส่วนลด incentive`,
    `${v.isComp ? 'หัก' : 'ไม่หัก'} ส่วนลด compensate`,
    `${v.incVat ? 'ไม่หัก' : 'หัก'} vat`
].join('\n')

const mapMonthIndex = (monthIndex: string): string => {
    const [yy, mm] = monthIndex.split('T')[0].split('-')
    return `${yy}/${mm}`
}

export const NotLightContractCols: TContractCol[] = [
    { header: 'id', valueMapper: v => v.id },
    { header: 'ชื่อซัพ', valueMapper: v => v.compName },
    { header: 'บริษัท', valueMapper: v => v.compType },
    { header: 'ชื่อรายรับภายใน', valueMapper: v => v.displayName ?? 'ไม่ระบุ' },
    { header: 'เริ่ม', valueMapper: v => customFormatDate(v.startDate) },
    { header: 'จบ', valueMapper: v => customFormatDate(v.endDate) },
    { header: 'ประเภท Step', valueMapper: v => mapStepType(v.stepType) },
    { header: 'เพดานยอดซื้อ', valueMapper: v => v.capAmount === 0 ? 'ไม่กำหนด' : formatLocalNumber(v.capAmount) },
    { header: 'หักส่วนลด', valueMapper: v => mapNotLightDiscountCriteria(v) },
    { header: 'เงื่อนไข', valueMapper: v => mapStepList(v.stepList) },
]

export const NotLightOrderCols: TOrderCol[] = [
    { header: 'เดือน', valueMapper: v => mapMonthIndex(v.monthIndex) },
    { header: 'ยอดซื้อตามวันรับเข้า', valueMapper: v => formatLocalNumber(v.ourAmount) },
    { header: 'ยอดซื้อตามบิลซัพ', valueMapper: v => formatLocalNumber(v.supplierAmount) },
    { header: 'รายได้ (our)', valueMapper: v => formatLocalNumber(v.ourIncome) },
    { header: 'รายได้ (supplier)', valueMapper: v => formatLocalNumber(v.supplierIncome) },
]
