import { PromotionSourcePipe } from './promotion-source.pipe';

describe('PromotionSourcePipe', () => {
  const pipe = new PromotionSourcePipe();

  it('labels the known sources', () => {
    expect(pipe.transform('HU')).toBe('Health Up');
    expect(pipe.transform('SUPPLIER')).toBe('ซัพพลายเออร์');
    expect(pipe.transform('BOTH')).toBe('ทั้ง Health Up และ ซัพพลายเออร์');
  });

  it('renders a label rather than a blank cell for a missing source', () => {
    expect(pipe.transform(null)).toBe('ไม่ระบุ');
    expect(pipe.transform(undefined)).toBe('ไม่ระบุ');
    expect(pipe.transform('')).toBe('ไม่ระบุ');
  });

  it('passes an unknown source through unchanged', () => {
    expect(pipe.transform('PARTNER')).toBe('PARTNER');
  });
});
