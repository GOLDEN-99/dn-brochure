import { TPromotionDetail } from '../../types/crm-promotion.type';
import { TCreatePromotionForm } from '../../pages/crm-promotion/create/create-bill-discount-promotion/createPromotionSchema';

function isoToNgbDate(iso: string) {
  const [year, month, day] = iso.split('T')[0].split('-').map(Number);
  return { year, month, day };
}

function timeStrToNgbTime(time: string) {
  const [hour, minute, second] = time.split(':').map(Number);
  return { hour, minute, second };
}

export function promotionDetailToForm(d: TPromotionDetail): TCreatePromotionForm {
  return {
    promotionMaster: {
      promotionName: d.promotionName,
      promotionDesc: d.promotionDesc,
      promotionType: d.promotionType,
      source: d.source,
      dateRange: {
        startDate: isoToNgbDate(d.startdate),
        endDate: isoToNgbDate(d.enddate),
      },
      promotionPriority: String(d.promotionPriority),
      promotionOrder: String(d.promotionOrder),
    },
    promotionDatetime: {
      activeDay: d.activeDays.split('').map(c => c === '1') as [boolean, boolean, boolean, boolean, boolean, boolean, boolean],
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
