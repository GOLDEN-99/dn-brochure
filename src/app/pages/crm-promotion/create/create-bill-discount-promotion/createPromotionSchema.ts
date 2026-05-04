import { apply, applyEach, applyWhen, applyWhenValue, disabled, FieldValidator, max, min, required, schema, SchemaOrSchemaFn, validate } from "@angular/forms/signals"
import {
  TPromotionMaster, TPromotionDatetime,
  TPromotionMember, TPromotionBranch,
  TPromotionBenefit, TPromotionFilterState,
  TProductRewardPool,
  TBranch,
  TMember,
  TPromotionTier,
  TTimeSpan
} from "../../../../types/crm-promotion.type"
import { NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap"

// ── Master ──────────────────────────────────────────────
export const initialMaster: TPromotionMaster = {
  promotionName: '',
  promotionDesc: '',
  promotionType: 'BILL',
  source: 'HU',
  startDate: { year: 0, month: 1, day: 1 },
  endDate: { year: 0, month: 1, day: 1 },
  promotionPriority: '0',
  promotionOrder: '0',
}
export const promotionMasterSchema = schema<TPromotionMaster>(_path => {
  required(_path.promotionName)
  required(_path.promotionType)
  required(_path.promotionOrder)
  required(_path.promotionPriority)
  required(_path.source)
  disabled(_path.promotionOrder, ({valueOf}) => valueOf(_path.source) === 'HU')
  //required(_path.promotionType) set from route
  required(_path.startDate)
  required(_path.endDate)
  //validate date range
  validate(_path, ({ valueOf }) => {
    const start = valueOf(_path.startDate)
    const end = valueOf(_path.endDate)
    if (start.year === 0 || end.year === 0) return null
    const toNum = (d: { year: number; month: number; day: number }) => d.year * 10000 + d.month * 100 + d.day
    return toNum(start) <= toNum(end)
      ? null
      : { kind: 'invalid date range', message: 'วันที่เริ่มต้องไม่มากว่าวันสิ้นสุด' }
  })
  //validate date invalid order
  validate(_path, (ctx) => {
    if (ctx.valueOf(_path.source) === 'HU' && ctx.valueOf(_path.promotionOrder) !== '0') return { kind: 'invalid order', message: '' }
    return null
  })
})

// ── Datetime ────────────────────────────────────────────
export const initialDatetime: TPromotionDatetime = {
  activeDay: [true, true, true, true, true, true, true],
  limitTime: false,

  timeSpan: {
      startTime: { hour: 0, minute: 0, second: 0 },
      endTime: { hour: 0, minute: 0, second: 0 },
  }
}

export const promotionDatetimeSchema = schema<TPromotionDatetime>(_path => {
  validate(_path.timeSpan, ({value, valueOf}) => {
    if(!valueOf(_path.limitTime)) return null
    const {startTime, endTime} = value()
    const toMin = (t: { hour: number; minute: number }) => t.hour * 60 + t.minute
    const startMin = toMin(startTime)
    const endMin = toMin(endTime)
    if(startMin === endMin) return { kind: 'time span error', message: 'เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด' }
    return toMin(startTime) < toMin(endTime)
      ? null
      : { kind: 'time span error', message: 'เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด' }
  })
  validate(_path.activeDay, ({value}) => value().reduceRight((acc, cur) => acc || cur) ? null : {kind: 'active day error', message : 'ต้องกำหนดวันใช้อย่างน้อย 1 วัน'}
  )
  disabled(_path.timeSpan.startTime, ({valueOf}) => !valueOf(_path.limitTime))
  disabled(_path.timeSpan.endTime, ({valueOf}) => !valueOf(_path.limitTime))
  required(_path.timeSpan, {when: ({valueOf}) => valueOf(_path.limitTime)})
})

// ── Member ──────────────────────────────────────────────
export const initialMember: TPromotionMember = {
  isMemberSpecific: false,
  members: [],
}
export const promotionMemberSchema = schema<TPromotionMember>(_path => {
  validate(_path, ({ valueOf }) => {
    if (!valueOf(_path.isMemberSpecific) && valueOf(_path.members).length > 0)
      return { kind: 'invalid member criteria', message: 'ไม่จำกัดสมาชิกต้องไม่มีรายชื่อสมาชิก' }
    return null
  })
  validate(_path.members, memberUniqueValidator)
})

// ── Branch ──────────────────────────────────────────────
export const initialBranch: TPromotionBranch = {
  isBranchSpecific: false,
  branches: [],
}
export const promotionBranchSchema = schema<TPromotionBranch>(_path => {
  validate(_path, ({ valueOf }) => {
    if (!valueOf(_path.isBranchSpecific) && valueOf(_path.branches).length > 0)
      return { kind: 'invalid branch criteria', message: 'ไม่จำกัดสาขาต้องไม่มีรายชื่อสาขา' }
    return null
  })
  validate(_path.branches, branchUniqueValidator)
})
// tier
export const promotionTierSchema = schema<TPromotionTier>(path => {
  min(path.rewardValue, 0)
  required(path.rewardValue)
  min(path.thresholdValue, 0)
  required(path.thresholdValue)
})
//reward
export const promotionRewardPercentSchema = schema<TProductRewardPool>((path) => {
  applyWhen(
    path,
    ({ value }) => value().itemBenefitType === 'PERCENT',
    (p) => {
      min(p.itemBenefitValue, 0)
      max(p.itemBenefitValue, 100)
    })
})
// ── Benefit ─────────────────────────────────────────────
export const initialBenefit: TPromotionBenefit = {
  action: 'BILLBATHDISC',
  thresholdType: 'BILLBATH',
  isRepeat: false,
  tiers: [],
  rewardPool: [],
}
export const promotionBenefitSchema = schema<TPromotionBenefit>(_path => {
  applyWhen(
    _path.tiers,
    ({ valueOf }) => valueOf(_path.isRepeat),
    (v) => {
      validate(v, ({ value }) => value().length === 1 ? null : { kind: 'invalid tiers', message: 'สิทธิประโยชน์แบบซ้ำ หรือทุกๆ ต้องมีแค่ 1 สิทธิ' })
    }
  )
  applyEach(_path.tiers, promotionTierSchema)
  validate(_path.rewardPool, ({ value, valueOf }) => {
    const action = valueOf(_path.action)
    if (action !== 'PWP' && action !== 'GIFT') return null
    return value().length === 0 ? { kind: 'reward pool empty', message: 'ต้องมีสินค้าในรายการรางวัล' } : null
  })
  validate(_path.rewardPool, rewardPoolUniqueValidator)
  //applyEach(_path.rewardPool, )
})

// ── Filter item (used as form-array item) ───────────────
export const initialFilterItem: TPromotionFilterState = {
  productList: [],
  filterType: 'COUNT',
  filterValue: 0,
}
export const promotionFilterItemSchema = schema<TPromotionFilterState>(_path => {
  validate(_path.filterValue, ({ value, valueOf }) => {
    const filterType = valueOf(_path.filterType)
    if (filterType === 'EXIST') return value() === 0 ? null : { kind: 'invalid filter value', message: 'ขั้นต่ำต้อง = 0' }
    return value() >= 1 ? null : { kind: 'invalid filter value', message: 'ขั้นต่ำต้อง >= 1' }
  })
})

export type TCreatePromotionForm = {
  promotionMaster: TPromotionMaster
  promotionDatetime: TPromotionDatetime
  promotionMember: TPromotionMember
  promotionBranch: TPromotionBranch
  promotionFilter: TPromotionFilterState[]
  promotionBenefit: TPromotionBenefit
}

export const createPromotionSchema = schema<TCreatePromotionForm>(_path => {
  apply(_path.promotionMaster, promotionMasterSchema)
  apply(_path.promotionDatetime, promotionDatetimeSchema)
  apply(_path.promotionMember, promotionMemberSchema)
  apply(_path.promotionBranch, promotionBranchSchema)
  applyEach(_path.promotionFilter, promotionFilterItemSchema)
  validate(_path.promotionFilter, ({ value }) => {
    let filterTypeRef: string | null = null
    const ref = new Set<string>()
    for (const filterOption of value()) {
      const { productList, filterType } = filterOption
      filterTypeRef ??= filterType
      // check every filter type should be the same
      if (filterType !== filterTypeRef) return { kind: 'invalid filter type', message: 'เงื่อนไขสินค้าต้องเหมืนกันทั้งกลุ่ม' }
      //check cross group duplicate product 
      for (const product of productList) {
        if (ref.has(product.goodCode)) return { kind: 'invalid filter cross product in filter', message: 'เงื่อนไขสินค้าต้องไม่มีสินค้าข้ามกลุ่ม' }
        ref.add(product.goodCode)
      }
    }
    return null
  })
  apply(_path.promotionBenefit, promotionBenefitSchema)

})


const uniqueValidator = <T, K>(fn: (value: T) => K): FieldValidator<Array<T>> => ({ value }) => {
  const ref = new Set<K>()
  for (const entry of value()) {
    const key = fn(entry)
    if (ref.has(key)) return { kind: 'nonunique entry', message: `duplicate list with key : ${key}` }
    ref.add(key)
  }
  return null
}

const rewardPoolUniqueValidator = uniqueValidator<TProductRewardPool, string>((p) => p.goodCode)
const branchUniqueValidator = uniqueValidator<TBranch, string>((b) => b.branchCode)
const memberUniqueValidator = uniqueValidator<TMember, number>(m => m.id)