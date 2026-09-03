import {
  isPromotionSourceInferred,
  resolvePromotionSource,
} from './resolve-promotion-source';

describe('resolvePromotionSource', () => {
  it('returns the stored source when the API gave one', () => {
    expect(resolvePromotionSource('SUPPLIER', 0)).toBe('SUPPLIER');
    expect(resolvePromotionSource('BOTH', 2)).toBe('BOTH');
  });

  it('does not let the order heuristic override a stored source', () => {
    // A supplier promotion may legally sit at order 0; only HU is forced there.
    expect(resolvePromotionSource('SUPPLIER', 0)).not.toBe('HU');
  });

  it('infers HU for a null source at order 0', () => {
    expect(resolvePromotionSource(null, 0)).toBe('HU');
  });

  it('infers SUPPLIER for a null source at a non-zero order', () => {
    expect(resolvePromotionSource(null, 1)).toBe('SUPPLIER');
    expect(resolvePromotionSource(undefined, 3)).toBe('SUPPLIER');
  });

  it('treats an empty string like a missing source', () => {
    expect(resolvePromotionSource('', 0)).toBe('HU');
    expect(resolvePromotionSource('', 2)).toBe('SUPPLIER');
  });
});

describe('isPromotionSourceInferred', () => {
  it('is true only when there is nothing to read back', () => {
    expect(isPromotionSourceInferred(null)).toBe(true);
    expect(isPromotionSourceInferred(undefined)).toBe(true);
    expect(isPromotionSourceInferred('')).toBe(true);
    expect(isPromotionSourceInferred('HU')).toBe(false);
  });
});
