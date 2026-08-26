import { floorSatang, roundSatang } from './money';

describe('floorSatang', () => {
  it('truncates sub-satang precision rather than rounding up', () => {
    // The reported bug: 0.257 rendered as 0.26, which then failed a max(0.257) check.
    expect(floorSatang(0.257)).toBe(0.25);
    expect(floorSatang(1234.567)).toBe(1234.56);
  });

  it('never exceeds a cleanly-represented raw amount', () => {
    for (const raw of [0.257, 1234.567, 99.999, 0.019, 12345678.909]) {
      expect(floorSatang(raw)).toBeLessThanOrEqual(raw);
    }
  });

  it('does not lose a satang to float subtraction noise', () => {
    expect(0.3 - 0.1).not.toBe(0.2); // guards the premise
    expect(floorSatang(0.3 - 0.1)).toBe(0.2);
    expect(floorSatang(1000.1 - 0.1)).toBe(1000);
  });

  it('leaves values already quantized to satang untouched', () => {
    expect(floorSatang(1234.56)).toBe(1234.56);
    expect(floorSatang(0)).toBe(0);
    expect(floorSatang(1)).toBe(1);
  });

  it('floors toward negative infinity for negative amounts', () => {
    expect(floorSatang(-0.257)).toBe(-0.26);
  });
});

describe('roundSatang', () => {
  it('rounds to the nearest satang', () => {
    expect(roundSatang(0.257)).toBe(0.26);
    expect(roundSatang(0.254)).toBe(0.25);
    expect(roundSatang(1234.567)).toBe(1234.57);
  });

  it('rounds half up despite float representation error', () => {
    expect(1.005 * 100).not.toBe(100.5); // guards the premise
    expect(roundSatang(1.005)).toBe(1.01);
    expect(roundSatang(8.615)).toBe(8.62);
  });

  it('clears float noise from summed amounts', () => {
    expect(roundSatang(0.1 + 0.2)).toBe(0.3);
  });

  it('leaves values already quantized to satang untouched', () => {
    expect(roundSatang(1234.56)).toBe(1234.56);
    expect(roundSatang(0)).toBe(0);
  });
});
