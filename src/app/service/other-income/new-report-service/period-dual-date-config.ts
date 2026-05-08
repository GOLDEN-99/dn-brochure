import { customFormatDate, formatLocalNumber } from "../../../lib/formatter";
import { TAoaConfig } from "../../xlsx-report/xlsx-report.service";

export type TPeriodDualDateResponse = {
    periodId: number;
    periodName: string;
    periodStart: string;
    periodEnd: string;
    headId: number;
    displayName: string;
    compCode: string;
    compName: string;
    compType: string;
    eventName: string;
    ourTotal: number;
    supplierTotal: number;
    difference: number;
    excludeBefore: number;
    includeAfter: number;
}

export const PeriodDualDateConfig: TAoaConfig<TPeriodDualDateResponse> = {
    sheetName: "ตรวจสอบความแตกต่าง",
    config: [
        { header: 'งวด', valueMapper: (v) => v.periodName },
        { header: 'เริ่ม', valueMapper: (v) => customFormatDate(v.periodStart) },
        { header: 'จบ', valueMapper: (v) => customFormatDate(v.periodEnd) },
        { header: 'ชื่อรายรับภายใน', valueMapper: (v) => v.displayName ?? 'ไม่ระบุ' },
        { header: 'กิจกรรม', valueMapper: (v) => v.eventName },
        { header: 'ชื่อซัพ', valueMapper: (v) => v.compName },
        { header: 'บริษัท', valueMapper: (v) => v.compType },
        { header: 'ยอดบริษัท', valueMapper: (v) => formatLocalNumber(v.ourTotal) },
        { header: 'ยอด Supplier', valueMapper: (v) => formatLocalNumber(v.supplierTotal) },
        { header: 'ส่วนต่าง', valueMapper: (v) => formatLocalNumber(v.difference) },
        { header: 'ตัดบิลข้ามงวด', valueMapper: (v) => formatLocalNumber(v.excludeBefore) },
        { header: 'บิลช้า (15 วัน)', valueMapper: (v) => formatLocalNumber(v.includeAfter) },
    ]
}
