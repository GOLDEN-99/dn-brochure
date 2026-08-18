import { TPromotionDetail } from '../../types/crm-promotion.type';
import { TCreatePromotionForm } from '../../pages/crm-promotion/create/create-bill-discount-promotion/createPromotionSchema';

function isoToNgbDate(iso: string) {
  const [year, month, day] = iso.split('T')[0].split('-').map(Number);
  return { year, month, day };
}

// The API can hold null/short values that the UI itself never produces. Guard the
// parsing so the edit page still renders instead of throwing on a blank field.
function timeStrToNgbTime(time: string | null | undefined) {
  const [hour = 0, minute = 0, second = 0] = (time ?? '').split(':').map(Number);
  return {
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
    second: Number.isFinite(second) ? second : 0,
  };
}

type TActiveDay = [boolean, boolean, boolean, boolean, boolean, boolean, boolean];

function activeDaysToFlags(activeDays: string | null | undefined): TActiveDay {
  const chars = (activeDays ?? '').padEnd(7, '0').slice(0, 7);
  return Array.from(chars, (c) => c === '1') as TActiveDay;
}

// Promotions created while `source` was never sent are stored as null. Fall back to
// the value that keeps the stored promotionOrder legal, so opening an old promotion
// in the edit form does not silently rewrite its calculation order.
function resolveSource(d: TPromotionDetail): string {
  return d.source ?? (d.promotionOrder === 0 ? 'HU' : 'SUPPLIER');
}

export function promotionDetailToForm(d: TPromotionDetail): TCreatePromotionForm {
  return {
    promotionMaster: {
      promotionName: d.promotionName,
      promotionDesc: d.promotionDesc,
      promotionType: d.promotionType,
      source: resolveSource(d),
      dateRange: {
        startDate: isoToNgbDate(d.startdate),
        endDate: isoToNgbDate(d.enddate),
      },
      promotionPriority: String(d.promotionPriority),
      promotionOrder: String(d.promotionOrder),
    },
    promotionDatetime: {
      activeDay: activeDaysToFlags(d.activeDays),
      limitTime: d.limitTime,
      timeSpan: {
        startTime: timeStrToNgbTime(d.startTime),
        endTime: timeStrToNgbTime(d.endTime),
      },
    },
    promotionMember: {
      isMemberSpecific: d.isMemberSpecific,
      members: d.members,
    },
    promotionBranch: {
      isBranchSpecific: d.isBranchSpecific,
      branches: d.branches,
    },
    promotionFilter: d.filterList.map(f => ({
      filterType: f.filterType,
      filterValue: f.filterValue,
      productList: f.productList,
    })),
    promotionBenefit: {
      action: d.action,
      thresholdType: d.thresholdType,
      isRepeat: d.isRepeat,
      tiers: d.tiers,
      rewardPool: d.rewardPool,
    },
  };
}
