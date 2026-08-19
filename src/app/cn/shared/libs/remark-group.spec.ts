import { TRemark } from '../types/cn.type';
import {
  DEFAULT_REMARK_CATEGORY,
  filterRemarkByGroup,
  hasRemarkGroup,
  isInGroup,
  REMARK_CATEGORIES,
} from './remark-group';

const remarks: TRemark[] = [
  { id: '3', remark: 'คลังส่งสินค้าเกิน', remarkGroup: '1' },
  { id: '13', remark: 'ขนส่ง ส่งผิดร้าน', remarkGroup: '1' },
  { id: '14', remark: 'lot ไม่ตรง', remarkGroup: '2' },
  { id: '61', remark: 'โอนเงินคืนค่าธรรมเนียมบัตรเครดิต 2.8%', remarkGroup: '7' },
];

// prod ยังส่งแค่ { id, remark }
const ungrouped: TRemark[] = [
  { id: '3', remark: 'คลังส่งสินค้าเกิน' },
  { id: '14', remark: 'lot ไม่ตรง' },
];

const cate = (id: string) => REMARK_CATEGORIES.find(c => c.id === id)!;

describe('remark-group', () => {
  it('exposes the seven groups GetCNRemark returns', () => {
    expect(REMARK_CATEGORIES.map(c => c.id)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  });

  it('defaults to group 1', () => {
    expect(DEFAULT_REMARK_CATEGORY.id).toBe('1');
  });

  // ต้อง join ด้วย id ไม่ใช่ label ภาษาไทย ถ้าผิดจะได้ลิสต์ว่างโดยไม่มี error
  it('joins remarkGroup on the category id', () => {
    expect(filterRemarkByGroup(cate('1'))(remarks).map(r => r.id)).toEqual(['3', '13']);
    expect(filterRemarkByGroup(cate('7'))(remarks).map(r => r.id)).toEqual(['61']);
  });

  it('does not join on the category label', () => {
    const byLabel = remarks.filter(({ remarkGroup }) => remarkGroup === cate('1').label);
    expect(byLabel).toEqual([]);
  });

  it('returns every remark when no category is picked', () => {
    expect(filterRemarkByGroup(null)(remarks)).toEqual(remarks);
  });

  it('detects whether the api sent the group field at all', () => {
    expect(hasRemarkGroup(remarks)).toBeTrue();
    expect(hasRemarkGroup(ungrouped)).toBeFalse();
  });

  // บน prod ค่า default เป็น '1' แต่ยังไม่มี remarkGroup — ห้ามกรองจนลิสต์ว่าง
  it('does not filter when the api omits the group field', () => {
    expect(filterRemarkByGroup(DEFAULT_REMARK_CATEGORY)(ungrouped)).toEqual(ungrouped);
    expect(filterRemarkByGroup(cate('7'))(ungrouped)).toEqual(ungrouped);
  });

  it('does not filter before the list has loaded', () => {
    expect(filterRemarkByGroup(DEFAULT_REMARK_CATEGORY)([])).toEqual([]);
  });

  describe('isInGroup', () => {
    it('accepts a remark that belongs to the picked category', () => {
      expect(isInGroup(remarks[0], cate('1'))).toBeTrue();
    });

    it('rejects a remark left over from another category', () => {
      expect(isInGroup(remarks[2], cate('1'))).toBeFalse();
    });

    it('accepts anything when there is no selection on either side', () => {
      expect(isInGroup(null, cate('1'))).toBeTrue();
      expect(isInGroup(remarks[2], null)).toBeTrue();
    });

    // ไม่งั้นสาเหตุที่ user เลือกไว้จะโดนล้างทิ้งทุกครั้งบน prod
    it('keeps a remark that carries no group at all', () => {
      expect(isInGroup(ungrouped[1], cate('1'))).toBeTrue();
    });
  });
});
