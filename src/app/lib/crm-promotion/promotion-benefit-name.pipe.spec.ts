import { PromotionBenefitNamePipe } from './promotion-benefit-name.pipe';
import { CHEAPEST_ACTION, REGISTER_FEE_ACTION } from './promotion-actions';

describe('PromotionBenefitNamePipe', () => {
  const pipe = new PromotionBenefitNamePipe();

  // The pipe's default is "สิทธิประโยชน์ไม่ถูกต้อง" — an unlabelled action does not read
  // as unknown, it reads as invalid, on a promotion that is perfectly fine.
  const INVALID = 'สิทธิประโยชน์ไม่ถูกต้อง';

  it('labels the new actions', () => {
    expect(pipe.transform(REGISTER_FEE_ACTION)).toBe('ฟรีค่าสมัครสมาชิก');
    expect(pipe.transform(CHEAPEST_ACTION)).toBe('แถมสินค้าถูกสุด(ชิ้น)');
  });

  it('does not render a known action as invalid', () => {
    for (const action of [REGISTER_FEE_ACTION, CHEAPEST_ACTION, 'GIFT', 'PWP']) {
      expect(pipe.transform(action)).not.toBe(INVALID);
    }
  });

  it('still flags a genuinely unknown action', () => {
    expect(pipe.transform('NOPE')).toBe(INVALID);
  });
});
