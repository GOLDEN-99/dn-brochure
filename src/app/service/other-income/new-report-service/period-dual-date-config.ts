import { customFormatDate, formatLocalNumber } from "../../../lib/formatter";
import { TAoaConfig } from "../../xlsx-report/xlsx-report.service";

export type TPeriodDualDateDetail = {
    goodCode: string;
    barcode: string;
    receNumb: string;
    receDate: string;
    billDate: string;
    orderNumb: string;
    amount: number;
    isLag: boolean;
}

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
    details: TPeriodDualDateDetail[];
}

export type TPeriodDualDateDetailRow = {
    periodName: string;
    displayName: string;
    compName: string;
    compType: string;
    eventName: string;
} & TPeriodDualDateDetail

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
    ]
}

export const PeriodDualDateDetailConfig: TAoaConfig<TPeriodDualDateDetailRow> = {
    sheetName: "รายละเอียด",
    config: [
        { header: 'งวด', valueMapper: (v) => v.periodName },
        { header: 'ชื่อรายรับภายใน', valueMapper: (v) => v.displayName ?? 'ไม่ระบุ' },
        { header: 'ชื่อซัพ', valueMapper: (v) => v.compName },
        { header: 'บริษัท', valueMapper: (v) => v.compType },
        { header: 'กิจกรรม', valueMapper: (v) => v.eventName },
        { header: 'รหัสสินค้า', valueMapper: (v) => v.barcode },
        { header: 'เลขใบรับ', valueMapper: (v) => v.receNumb },
        { header: 'วันรับ', valueMapper: (v) => customFormatDate(v.receDate) },
        { header: 'วันบิล', valueMapper: (v) => customFormatDate(v.billDate) },
        { header: 'เลขออร์เดอร์', valueMapper: (v) => v.orderNumb },
        { header: 'จำนวนเงิน', valueMapper: (v) => formatLocalNumber(v.amount) },
        { header: 'Lag', valueMapper: (v) => v.isLag ? 'ใช่' : '-' },
    ]
}
