import { customFormatDate, customFormatMonth, formatLocalNumber } from "../../../lib/formatter"
import { TAoaConfig } from "../../xlsx-report/xlsx-report.service"

export const DCMonthConfig: TAoaConfig<TMonthlyReportResponse> = {
    sheetName: "dc rebate",
    config: [
        { header: 'ชื่อซัพ', valueMapper: (v) => v.compName },
        { header: 'บริษัท', valueMapper: (v) => v.compType },
        { header: 'ชื่อรายรับภายใน', valueMapper: (v) => v.displayName ?? 'ไม่ระบุ' },
        { header: 'กิจกรรม', valueMapper: (v) => v.eventName },
        { header: 'วิธีรับรู้รายได้', valueMapper: v => v.incomeList.join(' ,') },
        { header: 'เดือน', valueMapper: (v) => customFormatMonth(v.startDate) },
        { header: 'เริ่มกิจกรรม', valueMapper: v => customFormatDate(v.eventStart) },
        { header: 'จบกิจกรรม', valueMapper: v => customFormatDate(v.eventEnd) },
        { header: 'ยอดซื้อ', valueMapper: (v) => formatLocalNumber(v.actualAmount) },
        { header: 'ยอด CN', valueMapper: (v) => v.cn },
        { header: 'ยอด คำนวน', valueMapper: (v) => formatLocalNumber(v.calAmount) },
        { header: 'รายได้', valueMapper: (v) => formatLocalNumber(v.incomeAmount) },
        { header: 'หมายเหตุ', valueMapper: (v) => v.incomeRemark },
    ]
}

export const LightBoxMonthConfig: TAoaConfig<TMonthlyReportResponse> = {
    sheetName: "light box",
    config: [
        { header: 'ชื่อซัพ', valueMapper: (v) => v.compName },
        { header: 'บริษัท', valueMapper: (v) => v.compType },
        { header: 'ชื่อรายรับภายใน', valueMapper: (v) => v.displayName ?? 'ไม่ระบุ' },
        { header: 'กิจกรรม', valueMapper: (v) => v.eventName },
        { header: 'วิธีรับรู้รายได้', valueMapper: v => v.incomeList.join(' ,') },
        { header: 'เดือน', valueMapper: (v) => customFormatMonth(v.startDate) },
        { header: 'เริ่มกิจกรรม', valueMapper: v => customFormatDate(v.eventStart) },
        { header: 'จบกิจกรรม', valueMapper: v => customFormatDate(v.eventEnd) },
        { header: 'ประมาณการรายได้', valueMapper: (v) => formatLocalNumber(v.incomeAmount) },
        { header: 'หมายเหตุ', valueMapper: (v) => v.incomeRemark },
    ]
}

export const IncentiveMonthConfig: TAoaConfig<TMonthlyReportResponse> = {
    sheetName: "incentive",
    config: [
        { header: 'ชื่อซัพ', valueMapper: (v) => v.compName },
        { header: 'บริษัท', valueMapper: (v) => v.compType },
        { header: 'ชื่อรายรับภายใน', valueMapper: (v) => v.displayName ?? 'ไม่ระบุ' },
        { header: 'กิจกรรม', valueMapper: (v) => v.eventName },
        { header: 'วิธีรับรู้รายได้', valueMapper: v => v.incomeList.join(' ,') },
        { header: 'เดือน', valueMapper: (v) => customFormatMonth(v.startDate) },
        { header: 'เริ่มกิจกรรม', valueMapper: v => customFormatDate(v.eventStart) },
        { header: 'จบกิจกรรม', valueMapper: v => customFormatDate(v.eventEnd) },
        { header: 'ประมาณการรายได้', valueMapper: (v) => formatLocalNumber(v.incomeAmount) },
        { header: 'หมายเหตุ', valueMapper: (v) => v.incomeRemark },
    ]
}

export type TMonthlyReportResponse = {
    id: number
    displayName: string
    compCode: string
    compType: string
    compName: string
    eventName: string
    actualAmount: number
    calAmount: number
    cn: number
    incomeAmount: number
    incomeRemark: string
    startDate: string
    endDate: string
    periodId: number | null
    eventStart: string
    eventEnd: string
    incomeList: string[]
}