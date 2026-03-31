import { customFormatDate, formatLocalNumber, mapIncomeType } from "../../../lib/formatter"
import { TAoaConfig } from "../../xlsx-report/xlsx-report.service"

export const AppendBillDiscountConfig: TAoaConfig<TIssueDocumentReportResponse> = {
    sheetName: "รอเพิ่ม CN ลดมากับบิล",
    config: [
        { header: 'ชื่อซัพ', valueMapper: (v) => v.compName },
        { header: 'บริษัท', valueMapper: (v) => v.compType },
        { header: 'ชื่อรายรับภายใน', valueMapper: (v) => v.displayName ?? 'ไม่ระบุ' },
        { header: 'กิจกรรม', valueMapper: (v) => v.eventName },
        { header: 'ระยะเวลาเก็บเงิน(เดือน)', valueMapper: v => v.periodDuration },
        { header: 'ชื่อ period', valueMapper: v => v.periodName },
        { header: 'เริ่ม', valueMapper: (v) => customFormatDate(v.periodStart) },
        { header: 'จบ', valueMapper: (v) => customFormatDate(v.periodEnd) },
        { header: 'รายได้', valueMapper: (v) => formatLocalNumber(v.totalIncome) },
        { header: 'หมายเหตุ', valueMapper: v => v.periodRemark },
        { header: 'period_id', valueMapper: v => v.periodId }
    ]
}

export const AppendFreeProductConfig: TAoaConfig<TIssueDocumentReportResponse> = {
    sheetName: "รรอเพิ่ม สินค้า ",
    config: [
        { header: 'ชื่อซัพ', valueMapper: (v) => v.compName },
        { header: 'บริษัท', valueMapper: (v) => v.compType },
        { header: 'ชื่อรายรับภายใน', valueMapper: (v) => v.displayName ?? 'ไม่ระบุ' },
        { header: 'กิจกรรม', valueMapper: (v) => v.eventName },
        { header: 'ระยะเวลาเก็บเงิน(เดือน)', valueMapper: v => v.periodDuration },
        { header: 'ชื่อ period', valueMapper: v => v.periodName },
        { header: 'เริ่ม', valueMapper: (v) => customFormatDate(v.periodStart) },
        { header: 'จบ', valueMapper: (v) => customFormatDate(v.periodEnd) },
        { header: 'รายได้', valueMapper: (v) => formatLocalNumber(v.totalIncome) },
        { header: 'หมายเหตุ', valueMapper: v => v.periodRemark },
        { header: 'period_id', valueMapper: v => v.periodId }
    ]
}

export const IssueInvoiceReportConfig: TAoaConfig<TIssueDocumentReportResponse> = {
    sheetName: "รอออกใบแจ้งหนี้",
    config: [
        { header: 'ชื่อซัพ', valueMapper: (v) => v.compName },
        { header: 'บริษัท', valueMapper: (v) => v.compType },
        { header: 'ชื่อรายรับภายใน', valueMapper: (v) => v.displayName ?? 'ไม่ระบุ' },
        { header: 'กิจกรรม', valueMapper: (v) => v.eventName },
        { header: 'ระยะเวลาเก็บเงิน(เดือน)', valueMapper: v => v.periodDuration },
        { header: 'ชื่อใบแจ้งหนี้', valueMapper: v => v.periodName },
        { header: 'เริ่ม', valueMapper: (v) => customFormatDate(v.periodStart) },
        { header: 'จบ', valueMapper: (v) => customFormatDate(v.periodEnd) },
        { header: 'รายได้', valueMapper: (v) => formatLocalNumber(v.totalIncome) },
        { header: 'หมายเหตุ', valueMapper: v => v.periodRemark },
        { header: 'period_id', valueMapper: v => v.periodId }
    ]
}

export const IssueCreditReportConfig: TAoaConfig<TIssueDocumentReportResponse> = {
    sheetName: "รอออกใบลดหนี้",
    config: [
        { header: 'ชื่อซัพ', valueMapper: (v) => v.compName },
        { header: 'บริษัท', valueMapper: (v) => v.compType },
        { header: 'ชื่อรายรับภายใน', valueMapper: (v) => v.displayName ?? 'ไม่ระบุ' },
        { header: 'กิจกรรม', valueMapper: (v) => v.eventName },
        { header: 'ระยะเวลาเก็บเงิน(เดือน)', valueMapper: v => v.periodDuration },
        { header: 'ชื่อใบแจ้งหนี้', valueMapper: v => v.periodName },
        { header: 'เริ่ม', valueMapper: (v) => customFormatDate(v.periodStart) },
        { header: 'จบ', valueMapper: (v) => customFormatDate(v.periodEnd) },
        { header: 'รายได้', valueMapper: (v) => formatLocalNumber(v.totalIncome) },
        { header: 'หมายเหตุ', valueMapper: v => v.periodRemark },
        { header: 'period_id', valueMapper: v => v.periodId }
    ]
}

export const IssueReceiptReportConfig: TAoaConfig<TIssueReceiptReportResponse> = {
    sheetName: "รอออกใบเสร็จ",
    config: [
        { header: 'ชื่อซัพ', valueMapper: (v) => v.compName },
        { header: 'บริษัท', valueMapper: (v) => v.compType },
        { header: 'กิจกรรม', valueMapper: (v) => v.eventName },
        { header: 'ประเภทรายรับ', valueMapper: (v) => v.incomeName },
        { header: 'ชื่อ period', valueMapper: (v) => v.periodName },
        { header: 'เริ่ม', valueMapper: (v) => customFormatDate(v.periodStart) },
        { header: 'จบ', valueMapper: (v) => customFormatDate(v.periodEnd) },
        { header: 'รายได้', valueMapper: (v) => formatLocalNumber(v.totalIncome) },
        { header: 'ประเภทรายได้', valueMapper: v => mapIncomeType(v.incomeType) },
        { header: 'เลขเอกสาร', valueMapper: (v) => v.docNumb },
        { header: 'วันที่เอกสาร', valueMapper: (v) => customFormatDate(v.docDate) },
        { header: 'ยอดเอกสาร', valueMapper: (v) => formatLocalNumber(v.docAmount) },
        { header: 'หมายเหตุเอกสาร', valueMapper: (v) => v.docRemark },
        { header: 'หมายเหตุ period', valueMapper: (v) => v.periodRemark },
        { header: 'period_id', valueMapper: (v) => v.periodId }
    ]
}

export type TIssueDocumentReportResponse = {
    id: number
    displayName: string
    compCode: string
    compType: string
    compName: string
    eventName: string
    incomeName: string
    periodId: number
    periodName: string
    periodRemark: string
    periodStart: string
    periodEnd: string
    totalAmount: number
    totalIncome: number
    periodDuration: number
}

export type TIssueReceiptReportResponse = {
    id: number
    displayName: string
    compCode: string
    compType: string
    compName: string
    eventName: string
    incomeType: number
    incomeName: string
    periodId: number
    periodName: string
    periodStart: string
    periodEnd: string
    totalAmount: number
    totalIncome: number
    periodRemark: string
    docNumb: string
    docDate: string
    docRemark: string
    docAmount: number
}