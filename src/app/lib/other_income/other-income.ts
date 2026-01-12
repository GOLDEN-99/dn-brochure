import { TFieldSelector, TObj } from "../../types"
import { TAnnualIncomeReport, TInvocieReport, TLightBoxReport, TMonthBuyReport, TMonthInceReport, TRangeBillReport, TRangeCreditReport, TRangeInvReceReport, TReceiptReport } from "./other-income.type"

const formatDisc = (v: boolean) => v ? 'ไม่หัก' : 'หัก'

const formatDate = (v: string) => v.split('T')[0]

const invocieMapper: TFieldSelector<TInvocieReport>[] = [
    { label: 'head id', fn: v => v.id },
    { label: 'period id', fn: v => v.periodId },
    { label: 'ชื่อใบแจ้งหนี้', fn: v => v.periodName },
    { label: 'หมายเหตุ period', fn: v => v.periodRemark },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'เริ่ม', fn: v => v.periodStart.split('T')[0] },
    { label: 'จบ', fn: v => v.periodEnd.split('T')[0] },
    { label: 'ยอดซื้อ', fn: v => v.totalAmount },
    { label: 'รายได้เรียกเก็บ', fn: v => v.totalIncome }
]
const receiptMapper: TFieldSelector<TReceiptReport>[] = [
    { label: 'head id', fn: v => v.id },
    { label: 'period id', fn: v => v.periodId },
    { label: 'ชื่อใบแจ้งหนี้', fn: v => v.periodName },
    { label: 'หมายเหตุ period', fn: v => v.periodRemark },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'เริ่ม', fn: v => formatDate(v.periodStart) },
    { label: 'จบ', fn: v => formatDate(v.periodEnd) },
    { label: 'ยอดซื้อ', fn: v => v.totalAmount },
    { label: 'รายได้เรียกเก็บ', fn: v => v.totalIncome },
    { label: 'เลขที่ใบแจ้งหนี้', fn: v => v.invNumb },
    { label: 'วันที่ใบแจ้งหนี้', fn: v => v.invDate.split('T')[0] },
    { label: 'ยอดใบแจ้งหนี้', fn: v => v.invAmount },
    { label: 'หมายเหตุ', fn: v => v.invRemark },
]

// backend send total_income / total_branch //
const lightboxMapper: TFieldSelector<TLightBoxReport>[] = [
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'เริ่ม', fn: v => formatDate(v.periodStart) },
    { label: 'จบ', fn: v => formatDate(v.periodEnd) },
    { label: 'รหัสสาขา', fn: v => v.branchCode },
    { label: 'ชื่อสาขา', fn: v => v.branchName },
    { label: 'รายได้เรียกเก็บ 12 เดือน', fn: v => v.totalIncome.toFixed(2) },
    { label: 'รายได้เรียกเก็บ/เดือน', fn: v => (v.totalIncome / 12).toFixed(2) },
]
const annualIncomeMapper: TFieldSelector<TAnnualIncomeReport>[] = [
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'รับรู้เป็น', fn: v => v.incomeName },
    { label: 'เริ่ม', fn: v => formatDate(v.startDate) },
    { label: 'จบ', fn: v => formatDate(v.endDate) },
    { label: 'ยอดซื้อ q1', fn: v => v.q1.totalAmount },
    { label: 'รายได้ q1', fn: v => v.q1.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล q1', fn: v => v.q1.orderAmount },
    { label: 'ยอดใบลดหนี้ q1', fn: v => v.q1.creditAmount },
    { label: 'ยอดใบแจ้งหนี้ q1', fn: v => v.q1.invAmount },
    { label: 'ยอดใบเสร็จ q1', fn: v => v.q1.receAmount },
    { label: 'ยอดซื้อ q2', fn: v => v.q2.totalAmount },
    { label: 'รายได้ q2', fn: v => v.q2.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล q2', fn: v => v.q2.orderAmount },
    { label: 'ยอดใบลดหนี้ q2', fn: v => v.q2.creditAmount },
    { label: 'ยอดใบแจ้งหนี้ q2', fn: v => v.q2.invAmount },
    { label: 'ยอดใบเสร็จ q2', fn: v => v.q2.receAmount },
    { label: 'ยอดซื้อ h1', fn: v => v.h1.totalAmount },
    { label: 'รายได้ h1', fn: v => v.h1.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล h1', fn: v => v.h1.orderAmount },
    { label: 'ยอดใบลดหนี้ h1', fn: v => v.h1.creditAmount },
    { label: 'ยอดใบแจ้งหนี้ h1', fn: v => v.h1.invAmount },
    { label: 'ยอดใบเสร็จ h1', fn: v => v.h1.receAmount },
    { label: 'ยอดซื้อ q3', fn: v => v.q3.totalAmount },
    { label: 'รายได้ q3', fn: v => v.q3.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล q3', fn: v => v.q3.orderAmount },
    { label: 'ยอดใบลดหนี้ q3', fn: v => v.q3.creditAmount },
    { label: 'ยอดใบแจ้งหนี้ q3', fn: v => v.q3.invAmount },
    { label: 'ยอดใบเสร็จ q3', fn: v => v.q3.receAmount },
    { label: 'ยอดซื้อ q4', fn: v => v.q4.totalAmount },
    { label: 'รายได้ q4', fn: v => v.q4.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล q4', fn: v => v.q4.orderAmount },
    { label: 'ยอดใบลดหนี้ q4', fn: v => v.q4.creditAmount },
    { label: 'ยอดใบแจ้งหนี้ q4', fn: v => v.q4.invAmount },
    { label: 'ยอดใบเสร็จ q4', fn: v => v.q4.receAmount },
    { label: 'ยอดซื้อ h2', fn: v => v.h2.totalAmount },
    { label: 'รายได้ h2', fn: v => v.h2.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล h2', fn: v => v.h2.orderAmount },
    { label: 'ยอดใบลดหนี้ h2', fn: v => v.h2.creditAmount },
    { label: 'ยอดใบแจ้งหนี้ h2', fn: v => v.h2.invAmount },
    { label: 'ยอดใบเสร็จ h2', fn: v => v.h2.receAmount },
    { label: 'ยอดซื้อ', fn: v => v.y.totalAmount },
    { label: 'รายได้', fn: v => v.y.totalIncome },
    { label: 'ยอดสินค้า/ท้ายบิล', fn: v => v.y.orderAmount },
    { label: 'ยอดใบลดหนี้', fn: v => v.y.creditAmount },
    { label: 'ยอดใบแจ้งหนี้', fn: v => v.y.invAmount },
    { label: 'ยอดใบเสร็จ', fn: v => v.y.receAmount },
]
const monthbuyMapper: TFieldSelector<TMonthBuyReport>[] = [
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'รับรู้เป็น', fn: v => v.incomeName },
    { label: 'หัก dc', fn: v => formatDisc(v.isDc) },
    { label: 'หัก rebate', fn: v => formatDisc(v.isRebate) },
    { label: 'หัก compensate', fn: v => formatDisc(v.isComp) },
    { label: 'หัก incentive', fn: v => formatDisc(v.isInce) },
    { label: 'หัก vat', fn: v => formatDisc(!v.incVat) },
    { label: 'เลข rece', fn: v => v.receNumb },
    { label: 'วันที่ rece', fn: v => formatDate(v.receDate) },
    { label: 'เลขที่บิล', fn: v => v.billNumb },
    { label: 'วันที่บิล', fn: v => formatDate(v.billDate) },
    { label: 'ยอด rece', fn: v => v.totalCost },
    { label: 'dc', fn: v => v.dcDisc },
    { label: 'rebate', fn: v => v.rebateDisc },
    { label: 'compensate', fn: v => v.compDisc },
    { label: 'incentive', fn: v => v.inceDisc },
    { label: 'vat', fn: v => v.totalVat },
    { label: 'subtotal', fn: v => v.subtotal },
    { label: 'ยอดซื้อคำนวน', fn: v => v.calAmount },
    { label: 'ยอด cn', fn: v => v.cn },
    { label: 'ยอดบันทึก', fn: v => v.actualAmount },
    { label: 'เหตุผล', fn: v => v.reason },
    { label: 'รายได้', fn: v => v.incomeAmount }
]
const monthinceMapper: TFieldSelector<TMonthInceReport>[] = [
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'รับรู้เป็น', fn: v => v.incomeName },
    { label: 'เริ่ม', fn: v => formatDate(v.startDate) },
    { label: 'จบ', fn: v => formatDate(v.endDate) },
    { label: 'หมายเหตุ', fn: v => v.incomeRemark },
    { label: 'รายได้', fn: v => v.incomeAmount }
]

const rangebillMapper: TFieldSelector<TRangeBillReport>[] = [
    { label: 'id', fn: v => v.id },
    { label: 'period id', fn: v => v.periodId },
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'เริ่ม', fn: v => formatDate(v.periodStart) },
    { label: 'จบ', fn: v => formatDate(v.periodEnd) },
    { label: 'ยอดซื้อ', fn: v => v.totalAmount },
    { label: 'รายได้เรียกเก็บ', fn: v => v.totalIncome },
    { label: 'เลข po', fn: v => v.orderNumb },
    { label: 'เลข rece', fn: v => v.receNumb },
    { label: 'ยอด', fn: v => v.subtotal },
    { label: 'หมายเหตุ', fn: v => v.remark },
]

const rangeInvReceMapper: TFieldSelector<TRangeInvReceReport>[] = [
    { label: 'id', fn: v => v.id },
    { label: 'period id', fn: v => v.periodId },
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'เริ่ม', fn: v => formatDate(v.periodStart) },
    { label: 'จบ', fn: v => formatDate(v.periodEnd) },
    { label: 'ยอดซื้อ', fn: v => v.totalAmount },
    { label: 'รายได้เรียกเก็บ', fn: v => v.totalIncome },
    { label: 'เลขที่ใบแจ้งหนี้', fn: v => v.invNumb },
    { label: 'วันที่ใบแจ้งหนี้', fn: v => v.invDate.split('T')[0] },
    { label: 'ยอดใบแจ้งหนี้', fn: v => v.invAmount },
    { label: 'หมายเหตุ', fn: v => v.invRemark },
    { label: 'เลขที่ใบเสร็จ', fn: v => v.receNumb },
    { label: 'วันที่ใบเสร็จ', fn: v => formatDate(v.receDate) },
    { label: 'ยอดใบเสร็จ', fn: v => v.receAmount },
    { label: 'หมายเหตุ', fn: v => v.receRemark },
]

const rangeCreditMapper: TFieldSelector<TRangeCreditReport>[] = [
    { label: 'id', fn: v => v.id },
    { label: 'period id', fn: v => v.periodId },
    { label: 'ชื่อ', fn: v => v.displayName },
    { label: 'กิจกรรม', fn: v => v.eventName },
    { label: 'รหัสซัพ', fn: v => v.compCode },
    { label: 'ชื่อซัพ', fn: v => v.compName },
    { label: 'เริ่ม', fn: v => v.periodStart.split('T')[0] },
    { label: 'จบ', fn: v => v.periodEnd.split('T')[0] },
    { label: 'ยอดซื้อ', fn: v => v.totalAmount },
    { label: 'รายได้เรียกเก็บ', fn: v => v.totalIncome },
    { label: 'เลขใบลดหนี้', fn: v => v.creditNumb },
    { label: 'วันที่ใบลดหนี้', fn: v => v.creditDate },
    { label: 'ยอดใบลดหนี้', fn: v => v.creditAmount },
    { label: 'หมายเหตุ', fn: v => v.creditRemark },
]

const mapToAoa = <T extends TObj>(mapper: TFieldSelector<T>[]) => (compType: string) =>
    (data: T[]) => [['บริษัท', ...mapper.map(({ label }) => label)], ...data.map(d => [compType, ...mapper.map(({ fn }) => fn(d))])]

export const formatInvoice = mapToAoa(invocieMapper)
export const formatReceipt = mapToAoa(receiptMapper)
export const formatLight = mapToAoa(lightboxMapper)
export const formatAnnualIncome = mapToAoa(annualIncomeMapper)
export const formatMonthbuy = mapToAoa(monthbuyMapper)
export const formatMonthince = mapToAoa(monthinceMapper)
export const formatRangeBill = mapToAoa(rangebillMapper)
export const formatRangeInvRece = mapToAoa(rangeInvReceMapper)
export const formatRangeCredit = mapToAoa(rangeCreditMapper)