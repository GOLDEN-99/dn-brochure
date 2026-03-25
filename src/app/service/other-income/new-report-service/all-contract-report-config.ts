import { customFormatDate, formatLocalNumber } from "../../../lib/formatter";
import { TAoaConfig } from "../../xlsx-report/xlsx-report.service";

export type TGetAllReportResponse = {
    id: number;
    compCode: string;
    compType: string;
    displayName: string;
    compName: string;
    startDate: string;
    endDate: string;
    eventName: string;
    eventType: string;
    incomeName: string;
    incomeType: string;
    receAmount: number;
    invAmount: number;
    freeItemAmount: number;
    billDiscountAmount: number;
    accAmount: number;
    accIncome: number;
    creditAmount: number;
}

export const AllContractConfig: TAoaConfig<TGetAllReportResponse> = {
    sheetName: "รายได้อื่นๆ",
    config: [
        { header: 'ชื่อซัพ', valueMapper: (v) => v.compName },
        { header: 'บริษัท', valueMapper: (v) => v.compType },
        { header: 'ชื่อรายรับภายใน', valueMapper: (v) => v.displayName ?? 'ไม่ระบุ' },
        { header: 'กิจกรรม', valueMapper: (v) => v.eventName },
        { header: 'เริ่ม', valueMapper: (v) => customFormatDate(v.startDate) },
        { header: 'จบ', valueMapper: (v) => customFormatDate(v.endDate) },
        { header: 'ยอดซื้อ', valueMapper: (v) => formatLocalNumber(v.accAmount) },
        { header: 'ประมาณการรายได้', valueMapper: (v) => formatLocalNumber(v.accIncome) },
        { header: 'ส่วนลดท้ายบิล', valueMapper: (v) => formatLocalNumber(v.billDiscountAmount) },
        { header: 'สินค้าแถม', valueMapper: (v) => formatLocalNumber(v.freeItemAmount) },
        { header: 'ยอดใบแจ้งหนี้', valueMapper: (v) => formatLocalNumber(v.invAmount) },
        { header: 'ยอดใบลดหนี้', valueMapper: (v) => formatLocalNumber(v.creditAmount) },
        { header: 'ยอดใบแจ้งหนี้', valueMapper: (v) => formatLocalNumber(v.receAmount) },
    ]
}