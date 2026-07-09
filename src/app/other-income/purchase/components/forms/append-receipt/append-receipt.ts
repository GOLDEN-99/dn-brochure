import { apply, applyEach, max, min, readonly, required, schema, validate } from '@angular/forms/signals';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TInvoiceWithRemaining, TPendingMatch } from './createReceiptForm.type';


export const matchesSchema = schema<TStagedMatch>((schema) => {
  readonly(schema.invoice.remainingAmount)
  max(schema.matchAmount, ({ valueOf }) => valueOf(schema.invoice.remainingAmount), { message: 'ยอดจับคู่ต้องไม่เกินยอดใบแจ้งหนี้' })
  min(schema.matchAmount, 1, { message: "ยอดจับคู่ขั้นต่ำ 1 บาท" })
})

/** Sub-form for editing the match amount for a just-selected invoice before it's staged into `matches`. */
export const pendingMatchSchema = schema<TPendingMatch>((schema) => {
  required(schema.invoice, { message: 'เลือกใบแจ้งหนี้' })
  min(schema.matchAmount, 1, { message: 'ยอดจับคู่ขั้นต่ำ 1 บาท' })
  validate(schema.matchAmount, ({ value, valueOf }) => {
    const invoice = valueOf(schema.invoice)
    if (!invoice) return null
    if (value() > invoice.remainingAmount) {
      return { kind: 'invalid-amount', message: `ยอดจับคู่ต้องไม่เกิน ${invoice.remainingAmount} บาท` }
    }
    return null
  })
})

export const appendReceiptSchema = schema<AppendReceiptForm>((schema) => {
  readonly(schema.openInvoiceAmount)
  required(schema.receNumb, { message: 'กรุณาใส่เลขที่ใบเสร็จ' });
  required(schema.receAmount, { message: 'กรุณากรอกตัวเลข' });
  min(schema.receAmount, 1, { message: "ยอดใบเสร็จรับเงินขั้นต่ำ 1 บาท" })
  max(schema.receAmount, ({ valueOf }) => valueOf(schema.openInvoiceAmount), { message: 'ยอดใบเสร็จรับเงินต้องไม่เกินยอดใบแจ้งหนี้' })
  applyEach(schema.matches, matchesSchema);

  validate(schema.matches, ({ value, valueOf }) => {
    const matches = value();
    if (matches.length === 0)
      return { kind: 'required', message: 'กรุณาเพิ่มรายการจับคู่อย่างน้อย 1 รายการ' };
    const total = matches.reduce((sum, m) => sum + m.matchAmount, 0);
    const receAmount = valueOf(schema.receAmount);
    if (total > receAmount)
      return { kind: 'invalid-amount', message: 'ยอดจับคู่รวมต้องไม่เกินยอดใบเสร็จ' };
    return null;
  });
});

export type TStagedMatch = {
  invoice: TInvoiceWithRemaining;
  matchAmount: number;
};

export type AppendReceiptForm = {
  openInvoiceAmount: number;
  receNumb: string;
  receDate: NgbDateStruct;
  receAmount: number;
  receRemark: string;
  matches: TStagedMatch[];
};
