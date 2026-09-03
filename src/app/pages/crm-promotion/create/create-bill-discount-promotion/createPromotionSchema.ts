import {
  apply,
  applyEach,
  applyWhen,
  disabled,
  FieldValidator,
  max,
  min,
  minLength,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import {
  TPromotionMaster,
  TPromotionDatetime,
  TPromotionMember,
  TPromotionBranch,
  TPromotionBenefit,
  TPromotionFilterState,
  TProductRewardPool,
  TBranch,
  TMember,
  TPromotionTier,
  TTimeSpan,
} from '../../../../types/crm-promotion.type';
import { CHEAPEST_ACTION } from '../../../../lib/crm-promotion/promotion-actions';


const dateRangeSchema = schema<TPromotionMaster['dateRange']>((_path) => {
  required(_path.startDate);
  required(_path.endDate);
});

// ── Master ──────────────────────────────────────────────
const _today = new Date();
const _todayDate = { year: _today.getFullYear(), month: _today.getMonth() + 1, day: _today.getDate() };

export const initialMaster: TPromotionMaster = {
  promotionName: '',
  promotionDesc: '',
  promotionType: 'BILL',
  source: 'HU',
  dateRange: {
    startDate: { ..._todayDate },
    endDate: { ..._todayDate },
  },
  promotionPriority: '0',
  promotionOrder: '0',
};
export const promotionMasterSchema = schema<TPromotionMaster>((_path) => {
  required(_path.promotionName);
  required(_path.promotionType);
  required(_path.promotionOrder);
  required(_path.promotionPriority);
  required(_path.source);
  disabled(
    _path.promotionOrder,
    ({ valueOf }) => valueOf(_path.source) === 'HU',
  );
  //required(_path.promotionType) set from route
  apply(_path.dateRange, dateRangeSchema);
  //validate date range
  validate(_path.dateRange, ({ value }) => {
    const { startDate: start, endDate: end } = value();
    const toNum = (d: { year: number; month: number; day: number }) =>
      d.year * 10000 + d.month * 100 + d.day;
    return toNum(start) <= toNum(end)
      ? null
      : {
        kind: 'invalid date range',
        message: 'วันที่เริ่มต้องไม่มากกว่าวันสิ้นสุด',
      };
  });

  //validate date invalid order
  // Checked on the master node, not on promotionOrder: that field is disabled for
  // HU and disabled fields are excluded from validation.
  validate(_path, ({ value }) => {
    const { source, promotionOrder } = value();
    if (source === 'HU' && promotionOrder !== '0')
      return {
        kind: 'invalid order',
        message: 'โปรโมชั่นของ Health Up ต้องเป็นลำดับสุดท้ายเท่านั้น',
      };
    return null;
  });
});

// ── Datetime ────────────────────────────────────────────
export const initialDatetime: TPromotionDatetime = {
  activeDay: [true, true, true, true, true, true, true],
  limitTime: false,

  timeSpan: {
    startTime: { hour: 0, minute: 0, second: 0 },
    endTime: { hour: 0, minute: 0, second: 0 },
  },
};

// ngb-timepicker emits whatever is typed (including minute 60) and null for a
// cleared box, so the range has to be checked here or a shifted time is saved.
const isValidTime = (t: { hour: number; minute: number }) =>
  Number.isInteger(t?.hour) &&
  Number.isInteger(t?.minute) &&
  t.hour >= 0 &&
  t.hour <= 23 &&
  t.minute >= 0 &&
  t.minute <= 59;

const timespanSchema = schema<TTimeSpan>((_path) => {
  validate(_path, ({ value }) => {
    const { startTime, endTime } = value();
    if (!isValidTime(startTime) || !isValidTime(endTime))
      return {
        kind: 'time out of range',
        message: 'เวลาต้องอยู่ในช่วง 00:00 - 23:59',
      };
    const toMin = (t: { hour: number; minute: number }) =>
      t.hour * 60 + t.minute;
    const startMin = toMin(startTime);
    const endMin = toMin(endTime);
    // The API rejects endTime 00:00 unconditionally; blocking it here keeps the
    // user from hitting a generic server error with no field-level hint.
    if (endMin === 0)
      return {
        kind: 'time span error',
        message: 'เวลาสิ้นสุดต้องไม่เป็น 00:00 (สูงสุด 23:59)',
      };
    if (startMin < endMin) return null
    return {
      kind: 'time span error',
      message: 'เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด',
    };
  })
});

export const promotionDatetimeSchema = schema<TPromotionDatetime>((_path) => {
  applyWhen(_path.timeSpan, ({ valueOf }) => valueOf(_path.limitTime), timespanSchema);
  validate(_path.activeDay, ({ value }) =>
    value().reduceRight((acc, cur) => acc || cur)
      ? null
      : { kind: 'active day error', message: 'ต้องกำหนดวันใช้อย่างน้อย 1 วัน' },
  );
  disabled(_path.timeSpan, ({ valueOf }) => !valueOf(_path.limitTime));
});

// ── Member ──────────────────────────────────────────────
export const initialMember: TPromotionMember = {
  isMemberSpecific: false,
  members: [],
};
export const promotionMemberSchema = schema<TPromotionMember>((_path) => {
  applyWhen(
    _path,
    ({ value }) => value().isMemberSpecific,
    (_path) => {
      minLength(_path.members, 1, {
        message: 'ต้องระบุระดับสมาชิกอย่างน้อย 1 ระดับ',
      });
    },
  );
  validate(_path.members, memberUniqueValidator);
});

// ── Branch ──────────────────────────────────────────────
export const initialBranch: TPromotionBranch = {
  isBranchSpecific: false,
  branches: [],
};
export const promotionBranchSchema = schema<TPromotionBranch>((_path) => {
  applyWhen(
    _path,
    ({ value }) => value().isBranchSpecific,
    (_path) => {
      minLength(_path.branches, 1, { message: 'ต้องระบุสาขาอย่างน้อย 1 สาขา' });
    },
  );
  validate(_path.branches, branchUniqueValidator);
});
// tier
export const promotionTierSchema = schema<TPromotionTier>((path) => {
  min(path.rewardValue, 0, { message: 'จำนวนส่วนลดต้องมากกว่าหรือเท่ากับ 0' });
  required(path.rewardValue, { message: 'ต้องระบุจำนวนส่วนลด' });
  min(path.thresholdValue, 0, { message: 'จำนวนขั้นต่ำต้องมากกว่าหรือเท่ากับ 0' });
  required(path.thresholdValue, { message: 'ต้องระบุจำนวนขั้นต่ำ' });
});
//reward
export const promotionRewardPercentSchema = schema<TProductRewardPool>(
  (path) => {
    applyWhen(
      path,
      ({ value }) => value().itemBenefitType === 'PERCENT',
      (p) => {
        min(p.itemBenefitValue, 0, { message: 'ค่าส่วนลดต้องมากกว่าหรือเท่ากับ 0' });
        max(p.itemBenefitValue, 100, { message: 'ค่าส่วนลดต้องไม่เกิน 100' });
      },
    );
  },
);
// ── Benefit ─────────────────────────────────────────────
export const initialBenefit: TPromotionBenefit = {
  action: 'BILLBATHDISC',
  thresholdType: 'BILLBATH',
  isRepeat: false,
  tiers: [],
  rewardPool: [],
};


export const promotionBenefitSchema = schema<TPromotionBenefit>((_path) => {
  required(_path.action);
  required(_path.thresholdType);
  applyWhen(
    _path,
    ({ valueOf }) => {
      const current = valueOf(_path.action);
      return current === 'PWP' || current === 'GIFT'
    },
    (_path) => {
      minLength(_path.rewardPool, 1, { message: 'ต้องมีสินค้าสิทธิประโยชน์อย่างน้อย 1 รายการ' })
    }
  );
  //validate tiers
  minLength(_path.tiers, 1, {
    message: 'ต้องมีเงื่อนไขสิทธิประโยชน์อย่างน้อย 1 สิทธิ',
  });
  applyWhen(
    _path.tiers,
    ({ valueOf }) => valueOf(_path.isRepeat),
    (v) => {
      validate(v, ({ value }) =>
        value().length === 1
          ? null
          : {
            kind: 'invalid tiers',
            message: 'สิทธิประโยชน์แบบซ้ำ หรือทุกๆ ต้องมีแค่ 1 สิทธิ',
          },
      );
    },
  );
  applyEach(_path.tiers, promotionTierSchema);
  applyEach(_path.tiers, (p) => {
    applyWhen(
      p.rewardValue,
      ({ valueOf }) => valueOf(_path.action).includes("PERCENT"),
      (p) => {
        max(p, 100, { message: 'ต้องไม่เกิน 100 %' })
      }
    );
    // CHEAPEST rewards a count of free units, not an amount: half an item cannot be
    // free, and a zero-unit reward is a promotion that does nothing at the till.
    applyWhen(
      p.rewardValue,
      ({ valueOf }) => valueOf(_path.action) === CHEAPEST_ACTION,
      (p) => {
        min(p, 1, { message: 'ต้องแถมอย่างน้อย 1 ชิ้น' });
        validate(p, ({ value }) =>
          Number.isInteger(value())
            ? null
            : {
              kind: 'not an integer',
              message: 'จำนวนชิ้นที่แถมต้องเป็นจำนวนเต็ม',
            },
        );
      }
    );
  });
  // distinct reward tier
  validate(_path.tiers, ({ value }) => {
    const rewardRef = new Set<number>();
    const thresholdRef = new Set<number>();
    for (const tier of value()) {
      const { rewardValue, thresholdValue } = tier;
      if (rewardRef.has(rewardValue)) return {
        kind: 'duplicate reward value',
        message: 'เงื่อนไขแต่ละระดับต้องมีจำนวนส่วนลดที่แตกต่างกัน',
      };
      if (thresholdRef.has(thresholdValue)) return {
        kind: 'duplicate threshold value',
        message: 'เงื่อนไขแต่ละระดับต้องมีจำนวนขั้นต่ำที่แตกต่างกัน',
      }
      rewardRef.add(rewardValue);
      thresholdRef.add(thresholdValue);
    }
    return null;
  });


  validate(_path.rewardPool, rewardPoolUniqueValidator);

});

// ── Filter item (used as form-array item) ───────────────
export const initialFilterItem: TPromotionFilterState = {
  productList: [],
  filterType: 'COUNT',
  filterValue: 0,
};
export const promotionFilterItemSchema = schema<TPromotionFilterState>(
  (_path) => {
    minLength(_path.productList, 1, {
      message: 'ต้องมีสินค้าอย่างน้อย 1 รายการ',
    });
    validate(_path.filterValue, ({ value, valueOf }) => {
      const filterType = valueOf(_path.filterType);
      if (filterType === 'EXIST')
        return value() === 0
          ? null
          : { kind: 'invalid filter value', message: 'ขั้นต่ำต้อง = 0' };
      return value() >= 1
        ? null
        : { kind: 'invalid filter value', message: 'ขั้นต่ำต้อง >= 1' };
    });
  },
);

export type TCreatePromotionForm = {
  promotionMaster: TPromotionMaster;
  promotionDatetime: TPromotionDatetime;
  promotionMember: TPromotionMember;
  promotionBranch: TPromotionBranch;
  promotionFilter: TPromotionFilterState[];
  promotionBenefit: TPromotionBenefit;
};

export const createPromotionSchema = schema<TCreatePromotionForm>((_path) => {
  apply(_path.promotionMaster, promotionMasterSchema);
  apply(_path.promotionDatetime, promotionDatetimeSchema);
  apply(_path.promotionMember, promotionMemberSchema);
  apply(_path.promotionBranch, promotionBranchSchema);

  applyWhen(
    _path,
    ({ valueOf }) => valueOf(_path.promotionMaster.promotionType) !== 'BILL',
    (_path) => {
      minLength(_path.promotionFilter, 1, {
        message: 'ต้องมีเงื่อนไขสินค้าอย่างน้อย 1 เงื่อนไข',
      });
    },
  );
  applyEach(_path.promotionFilter, promotionFilterItemSchema);
  validate(_path.promotionFilter, ({ value }) => {
    let filterTypeRef: string | null = null;
    const ref = new Set<string>();
    for (const filterOption of value()) {
      const { productList, filterType } = filterOption;
      filterTypeRef ??= filterType;
      // check every filter type should be the same
      if (filterType !== filterTypeRef)
        return {
          kind: 'invalid filter type',
          message: 'เงื่อนไขสินค้าต้องเหมือนกันทั้งกลุ่ม',
        };
      //check cross group duplicate product
      for (const product of productList) {
        if (ref.has(product.goodCode))
          return {
            kind: 'invalid filter cross product in filter',
            message: 'เงื่อนไขสินค้าต้องไม่มีสินค้าข้ามกลุ่ม',
          };
        ref.add(product.goodCode);
      }
    }
    return null;
  });
  apply(_path.promotionBenefit, promotionBenefitSchema);
});

const uniqueValidator =
  <T, K>(fn: (value: T) => K): FieldValidator<Array<T>> =>
    ({ value }) => {
      const ref = new Set<K>();
      for (const entry of value()) {
        const key = fn(entry);
        if (ref.has(key))
          return {
            kind: 'nonunique entry',
            message: `duplicate list with key : ${key}`,
          };
        ref.add(key);
      }
      return null;
    };

const rewardPoolUniqueValidator = uniqueValidator<TProductRewardPool, string>(
  (p) => p.goodCode,
);
const branchUniqueValidator = uniqueValidator<TBranch, string>(
  (b) => b.branchCode,
);
const memberUniqueValidator = uniqueValidator<TMember, number>((m) => m.id);
