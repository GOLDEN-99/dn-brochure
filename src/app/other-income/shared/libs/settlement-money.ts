import { TMaybe } from '../../../shared/types/index.type';
import { TSettlementDetail } from '../types/other-income.type';
import { floorSatang } from './money';

/**
 * Quantizes every money field on a settlement to satang, at the API boundary.
 *
 * `supplierIncome` is a server-side calculation (order amount x rate %), so it routinely
 * carries more precision than baht/satang can express — and it is the ceiling the invoice
 * form validates against. Quantizing once here keeps the summary card, the report and the
 * form all agreeing on the same number instead of each rounding for render only.
 *
 * Deliberately floors rather than rounds: a quantized ceiling must never exceed the raw
 * value the server itself validates against, or we would just move the rejection from our
 * form to the backend. See `money.ts`.
 *
 * Deliberately explicit per field rather than a generic deep walk over numbers — contract
 * rates, bracket thresholds and ids share these payloads and must not be quantized.
 */
export function normalizeSettlementDetailMoney(settlement: TSettlementDetail): TSettlementDetail {
  return {
    ...settlement,
    systemOrderAmount: floorMaybe(settlement.systemOrderAmount),
    cnOrderAmount: floorMaybe(settlement.cnOrderAmount),
    systemIncome: floorSatang(settlement.systemIncome),
    supplierOrderAmount: floorMaybe(settlement.supplierOrderAmount),
    supplierIncome: floorSatang(settlement.supplierIncome),
    cumulativeOrderAtClose: floorMaybe(settlement.cumulativeOrderAtClose),
    billDiscounts: settlement.billDiscounts.map(row => ({ ...row, subtotalAmount: floorSatang(row.subtotalAmount) })),
    freeItems: settlement.freeItems.map(row => ({ ...row, subtotalAmount: floorSatang(row.subtotalAmount) })),
    invoices: settlement.invoices.map(row => ({ ...row, invoiceAmount: floorSatang(row.invoiceAmount) })),
    receipts: settlement.receipts.map(row => ({ ...row, receAmount: floorSatang(row.receAmount) })),
    creditNotes: settlement.creditNotes.map(row => ({ ...row, creditAmount: floorSatang(row.creditAmount) })),
    matches: settlement.matches.map(row => ({ ...row, matchedAmount: floorSatang(row.matchedAmount) })),
  }
}

const floorMaybe = (amount: TMaybe<number>): TMaybe<number> =>
  amount === null ? null : floorSatang(amount)
