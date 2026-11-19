import {
  BUNDLE_BENEFIT_HINTS,
  CHEAPEST_LABEL,
  CHEAPEST_SHAPE_HINT,
  GIFT_SHAPE_HINT,
  LADDER_HINT,
  benefitHintFor,
} from './benefit-hints';
import { CHEAPEST_ACTION } from './promotion-actions';

describe('benefit hints (z8qgvby6ht)', () => {
  it('names the gift shape for สินค้าแถม and the cheapest shape for CHEAPEST', () => {
    expect(benefitHintFor(BUNDLE_BENEFIT_HINTS, 'GIFT')).toBe(GIFT_SHAPE_HINT);
    expect(benefitHintFor(BUNDLE_BENEFIT_HINTS, CHEAPEST_ACTION)).toBe(CHEAPEST_SHAPE_HINT);
  });

  it('has nothing to say for a discount action, and nothing on a page without hints', () => {
    expect(benefitHintFor(BUNDLE_BENEFIT_HINTS, 'BUNDLEBATHDISC')).toBeNull();
    expect(benefitHintFor(undefined, 'GIFT')).toBeNull();
  });

  it('tells the two shapes apart by who picks up the gift', () => {
    // The whole point of the pair: with สินค้าแถม the POS adds the gift, with CHEAPEST the
    // customer brings all N+M and the cheapest goes free.
    expect(GIFT_SHAPE_HINT).toContain('เพิ่มเข้าบิล');
    expect(CHEAPEST_SHAPE_HINT).toContain('N+M');
  });

  it('keeps the ladder rule and the new label verbatim from the card', () => {
    expect(LADDER_HINT).toContain('อย่าแยกเป็นหลายโปร');
    expect(CHEAPEST_LABEL).toBe('ซื้อ N แถม M (แถมชิ้นที่ถูกที่สุดในชุด)');
  });
});
