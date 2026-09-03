import {
    CRM_BILL_REWARD, CRM_BUNDLE_REWARD, CRM_INLINE_REWARD, ICrmPageConfig
} from "../../service/crm-promotion/crm-token"
import { CHEAPEST_ACTION, REGISTER_FEE_ACTION } from "../../lib/crm-promotion/promotion-actions"
import {
    initialMaster, initialDatetime, initialMember, initialBranch, initialBenefit
} from "../../pages/crm-promotion/create/create-bill-discount-promotion/createPromotionSchema"
import { TPromotionDetail } from "../../types/crm-promotion.type"
import { promotionDetailToForm } from "./promotion-detail-to-form"

export function provideCreatePromotionConfig(path: string): ICrmPageConfig {
    switch (path) {
        case "create-bill":
            return {
                pageName: "ส่วนลดท้ายบิล",
                initialData: {
                    promotionMaster: { ...initialMaster, promotionType: 'BILL' },
                    promotionDatetime: initialDatetime,
                    promotionMember: initialMember,
                    promotionBranch: initialBranch,
                    promotionFilter: [],
                    promotionBenefit: {
                        ...initialBenefit,
                        action: 'BILLBATHDISC',
                        thresholdType: 'BILLSUBTOTAL',
                        isRepeat: false,
                        tiers: [{ thresholdValue: 0, rewardValue: 0 }],
                    },
                },
                filterOption: {
                    showFilter: false,
                    showBundle: false,
                    showItem: false,
                    showList: false,
                },
                rewardOption: {
                    rewardList: CRM_BILL_REWARD,
                    thresholdList: [
                        { threshold: "BILLSUBTOTAL", label: "ยอดบิล(บาท)" },
                        { threshold: "BILLCOUNT", label: "จำนวนสินค้า(ชิ้น)" },
                    ]
                }
            }
        case "create-group":
            return {
                pageName: "ส่วนลดตามกลุ่ม",
                initialData: {
                    promotionMaster: { ...initialMaster, promotionType: 'BUNDLE' },
                    promotionDatetime: initialDatetime,
                    promotionMember: initialMember,
                    promotionBranch: initialBranch,
                    promotionFilter: [],
                    promotionBenefit: {
                        ...initialBenefit,
                        action: 'BUNDLEBATHDISC',
                        thresholdType: 'BUNDLECOUNT',
                        isRepeat: true,
                        tiers: [{ thresholdValue: 1, rewardValue: 0 }],
                    },
                },
                filterOption: {
                    showFilter: true,
                    showBundle: true,
                    showItem: false,
                    showList: true,
                },
                rewardOption: {
                    rewardList: CRM_BUNDLE_REWARD,
                    thresholdList: [
                        { threshold: "BUNDLECOUNT", label: "จำนวน SET (ชุด)" },
                    ]
                }
            }
        case "create-inline":
            return {
                pageName: 'ลดรายสินค้า',
                initialData: {
                    promotionMaster: { ...initialMaster, promotionType: 'ITEM' },
                    promotionDatetime: initialDatetime,
                    promotionMember: initialMember,
                    promotionBranch: initialBranch,
                    promotionFilter: [{ filterType: 'EXIST', filterValue: 0, productList: [] }],
                    promotionBenefit: {
                        ...initialBenefit,
                        action: 'ITEMPERCENTDISC',
                        thresholdType: 'ITEMEXIST',
                        isRepeat: true,
                        tiers: [{ thresholdValue: 0, rewardValue: 0 }],
                    },
                },
                filterOption: {
                    showFilter: true,
                    showBundle: false,
                    showItem: true,
                    showList: false,
                },
                rewardOption: {
                    rewardList: CRM_INLINE_REWARD,
                    thresholdList: []
                }
            }
        case "create-register-fee":
            // One SKU (11755) onto the bill at 0 baht so the vendor service promotes the
            // customer to HUG Club. Nothing about it is per-promotion except the bill
            // minimum, so the page asks for that and nothing else: the action is pinned,
            // the reward value is always 0, and the reward pool is derived at submit
            // (see buildRewardPool in promotion-form.component.ts) rather than authored.
            return {
                pageName: 'ค่าสมาชิก',
                initialData: {
                    promotionMaster: { ...initialMaster, promotionType: 'BILL' },
                    promotionDatetime: initialDatetime,
                    promotionMember: initialMember,
                    promotionBranch: initialBranch,
                    promotionFilter: [],
                    promotionBenefit: {
                        ...initialBenefit,
                        action: REGISTER_FEE_ACTION,
                        thresholdType: 'BILLSUBTOTAL',
                        isRepeat: false,
                        tiers: [{ thresholdValue: 0, rewardValue: 0 }],
                        rewardPool: [],
                    },
                },
                filterOption: {
                    showFilter: false,
                    showBundle: false,
                    showItem: false,
                    showList: false,
                },
                rewardOption: {
                    rewardList: [{ action: REGISTER_FEE_ACTION, label: "ฟรีค่าสมัครสมาชิก" }],
                    thresholdList: [{ threshold: "BILLSUBTOTAL", label: "ยอดบิล(บาท)" }],
                    fixedAction: true,
                    showRewardInput: false,
                }
            }
        case "create-cheapest":
            // The N cheapest units of the bundle become free. Threshold is pinned to one
            // complete set and the promotion repeats, so a basket of three sets gets three
            // times the reward -- a non-repeating single rung would give N free units for
            // any basket size, which is almost never what the author means.
            return {
                pageName: 'แถมในกลุ่ม',
                initialData: {
                    promotionMaster: { ...initialMaster, promotionType: 'BUNDLE' },
                    promotionDatetime: initialDatetime,
                    promotionMember: initialMember,
                    promotionBranch: initialBranch,
                    promotionFilter: [],
                    promotionBenefit: {
                        ...initialBenefit,
                        action: CHEAPEST_ACTION,
                        thresholdType: 'BUNDLECOUNT',
                        isRepeat: true,
                        tiers: [{ thresholdValue: 1, rewardValue: 1 }],
                        rewardPool: [],
                    },
                },
                filterOption: {
                    showFilter: true,
                    showBundle: true,
                    showItem: false,
                    showList: true,
                },
                rewardOption: {
                    rewardList: [{ action: CHEAPEST_ACTION, label: "แถมสินค้าถูกสุด(ชิ้น)" }],
                    thresholdList: [{ threshold: "BUNDLECOUNT", label: "จำนวน SET (ชุด)" }],
                    fixedAction: true,
                    showThresholdInput: false,
                }
            }
        default:
            throw new Error("invalid path name")
    }
}

export function provideEditPromotionConfig(detail: TPromotionDetail): ICrmPageConfig {
    const filterOptions: Record<string, ICrmPageConfig['filterOption']> = {
        BILL: { showFilter: false, showBundle: false, showItem: false, showList: false },
        BUNDLE: { showFilter: true, showBundle: true, showItem: false, showList: true },
        ITEM: { showFilter: true, showBundle: false, showItem: true, showList: false },
    }
    const rewardOptions: Record<string, ICrmPageConfig['rewardOption']> = {
        BILL: {
            rewardList: CRM_BILL_REWARD,
            thresholdList: [
                { threshold: "BILLSUBTOTAL", label: "ยอดบิล(บาท)" },
                { threshold: "BILLCOUNT", label: "จำนวนสินค้า(ชิ้น)" },
            ],
        },
        BUNDLE: {
            rewardList: CRM_BUNDLE_REWARD,
            thresholdList: [{ threshold: "BUNDLECOUNT", label: "จำนวน SET (ชุด)" }],
        },
        ITEM: {
            rewardList: CRM_INLINE_REWARD,
            thresholdList: [],
        },
    }
    return {
        pageName: "แก้ไขโปรโมชั่น",
        initialData: promotionDetailToForm(detail),
        filterOption: filterOptions[detail.promotionType] ?? filterOptions['BILL'],
        rewardOption: rewardOptions[detail.promotionType] ?? rewardOptions['BILL'],
    }
}
