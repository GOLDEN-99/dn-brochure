// Always-visible copy under the benefit controls (ClickUp z8qgvby6ht). Two set-up mistakes reached
// QA in the 09/69 period because the form accepted both shapes and nothing on screen said which
// one fits: buy-1-get-1 authored as สินค้าแถม with the same good as the gift, and one spend ladder
// split into two promotions so a 790 bill earned both rungs. The exact Thai is the card's; keep it
// in step with the card when either changes.

import { CHEAPEST_ACTION } from './promotion-actions';

/** Label for the CHEAPEST action wherever it appears; the stored value stays CHEAPEST. */
export const CHEAPEST_LABEL = 'ซื้อ N แถม M (แถมชิ้นที่ถูกที่สุดในชุด)';

/** สินค้าแถม: the gift is added to the bill at checkout; the customer picks up only the N. */
export const GIFT_SHAPE_HINT =
  'ของแถมจะถูก "เพิ่มเข้าบิล" ตอนจ่าย เหมาะกับโปร "ซื้อ N แถม M" ที่ลูกค้าหยิบแค่ N ชิ้น ' +
  'เช่น ซื้อ 1 แถม 1 ลูกค้าหยิบ 1 ชิ้น POS จะเพิ่มอีก 1 ชิ้นเป็นของแถมให้เอง ' +
  '(ต้องใช้ POS build ที่รองรับ ก.ย. 2026 ขึ้นไป)';

/** CHEAPEST: the customer picks up all N+M; the cheapest in the set is free, so count the gift in. */
export const CHEAPEST_SHAPE_HINT =
  'ใช้กับโปร "ซื้อ N แถม M" ที่ให้ลูกค้าหยิบครบ N+M ชิ้นเอง โดยชิ้นที่ถูกที่สุดในชุดเป็นตัวฟรี ' +
  'ให้นับชิ้นแถมรวมในจำนวนชิ้นด้วย เช่น ซื้อ 1 แถม 1 = กลุ่มละ 2 ชิ้น แถม 1 ชิ้น / ' +
  'ซื้อ 2 แถม 1 = กลุ่มละ 3 ชิ้น แถม 1 ชิ้น';

/** Spend page: a ladder is rungs in ONE promotion, or the customer gets every rung at once. */
export const LADDER_HINT =
  'ถ้าโปรมีหลายขั้น (เช่น ซื้อครบ 500 ลด 50 / ครบ 700 ลด 70) ให้เพิ่มเป็นขั้นในโปรนี้ ' +
  'อย่าแยกเป็นหลายโปร ไม่อย่างนั้นลูกค้าจะได้ทุกขั้นรวมกัน';

/** Hint per action on the set-bundle pages (ส่วนลดตามกลุ่มสินค้า and แถมในกลุ่ม). */
export const BUNDLE_BENEFIT_HINTS: Readonly<Record<string, string>> = {
  GIFT: GIFT_SHAPE_HINT,
  [CHEAPEST_ACTION]: CHEAPEST_SHAPE_HINT,
};

/** The hint for the selected action, or null when the page has none for it. */
export function benefitHintFor(
  hints: Readonly<Record<string, string>> | undefined,
  action: string,
): string | null {
  return hints?.[action] ?? null;
}
