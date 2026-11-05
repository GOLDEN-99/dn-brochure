import { flashSaleSlots, MAX_FLASH_SALE_SLOTS } from './flash-sale-layout';

/** rows, as the count of slots sharing each `top` */
const rowShape = (n: number) => {
  const slots = flashSaleSlots(n);
  const byTop = new Map<string, number>();
  for (const s of slots) byTop.set(s.top, (byTop.get(s.top) ?? 0) + 1);
  return [...byTop.values()];
};

describe('flashSaleSlots', () => {
  it('matches the layouts measured from the design samples', () => {
    expect(rowShape(1)).toEqual([1]);
    expect(rowShape(2)).toEqual([2]);
    expect(rowShape(3)).toEqual([3]);
    expect(rowShape(5)).toEqual([2, 3]);
    expect(rowShape(6)).toEqual([3, 3]);
    expect(rowShape(7)).toEqual([4, 3]);
  });

  it('lays 4 out as 2 + 2, as design confirmed', () => {
    expect(rowShape(4)).toEqual([2, 2]);
  });

  it('returns one slot per product', () => {
    for (let n = 1; n <= MAX_FLASH_SALE_SLOTS; n++) {
      expect(flashSaleSlots(n).length).toBe(n);
    }
  });

  it('centres a row of two, since no artwork covers a ragged edge', () => {
    const [a, b] = flashSaleSlots(2 + 3).slice(0, 2);
    const left = parseFloat(a.left);
    const right = parseFloat(b.left) + parseFloat(b.width);
    expect(left).toBeCloseTo(100 - right, 0);
  });

  it('keeps every card square by leaving height to the component', () => {
    // the slot carries width only; aspect-ratio: 1 does the rest
    for (const s of flashSaleSlots(7)) {
      expect(s.width.endsWith('%')).toBeTrue();
      expect(Object.keys(s).sort()).toEqual(['left', 'top', 'width']);
    }
  });

  it('clamps above the largest layout rather than inventing one', () => {
    expect(flashSaleSlots(9).length).toBe(MAX_FLASH_SALE_SLOTS);
    expect(rowShape(20)).toEqual([4, 3]);
  });

  it('returns nothing for an empty or nonsense count', () => {
    expect(flashSaleSlots(0)).toEqual([]);
    expect(flashSaleSlots(-3)).toEqual([]);
    expect(flashSaleSlots(NaN)).toEqual([]);
  });
});
