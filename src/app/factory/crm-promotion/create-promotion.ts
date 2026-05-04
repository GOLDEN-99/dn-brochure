import { CRM_BUNDLE_REWARD, CRM_INLINE_REWARD, ICrmPageConfig } from "../../service/crm-promotion/crm-token"
import {
    initialMaster, initialDatetime, initialMember, initialBranch, initialBenefit
} from "../../pages/crm-promotion/create/create-bill-discount-promotion/createPromotionSchema"

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
                    rewardList: [
                        { action: "BILLBATHDISC", label: "ลดทั้งบิลเป็นบาท" },
                        { action: "BILLPERCENTDISC", label: "ลดทั้งบิลเป็นเปอร์เซ็นต์" },
                        { action: "PWP", label: "สิทธิแลกซื้อ" },
                        { action: "GIFT", label: "สินค้าแถม" }
                    ],
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
        default:
            throw new Error("invalid path name")
    }
}
