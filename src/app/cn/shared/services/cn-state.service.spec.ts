import { TestBed } from '@angular/core/testing';
import { CnStateService } from './cn-state.service';
import { DEFAULT_REMARK_CATEGORY, REMARK_CATEGORIES } from '../libs/remark-group';

describe('CnStateService — remarkCategory', () => {
  let service: CnStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [CnStateService] });
    service = TestBed.inject(CnStateService);
  });

  it('starts on group 1', () => {
    expect(service.formState().stepOne.remarkCategory).toEqual(DEFAULT_REMARK_CATEGORY);
  });

  // ถ้า required() ไม่ยอมรับ object ปุ่มถัดไปจะกดไม่ได้ตลอดกาล
  it('is valid at its default value', () => {
    expect(service.requestCNForm.stepOne.remarkCategory().valid()).toBeTrue();
    expect(service.requestCNForm.stepOne.remarkCategory().errors().length).toBe(0);
  });

  it('stays valid after switching category', () => {
    service.formState.update(s => ({
      ...s,
      stepOne: { ...s.stepOne, remarkCategory: REMARK_CATEGORIES[3] },
    }));
    expect(service.requestCNForm.stepOne.remarkCategory().valid()).toBeTrue();
  });

  it('is invalid only if something clears it', () => {
    service.formState.update(s => ({
      ...s,
      stepOne: { ...s.stepOne, remarkCategory: null },
    }));
    expect(service.requestCNForm.stepOne.remarkCategory().valid()).toBeFalse();
  });
});
