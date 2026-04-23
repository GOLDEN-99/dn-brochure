import { CRM_BILL_VARIATION, CRM_BUNDLE_REWARD, CRM_BUNDLE_VARIATION, CRM_INLINE_REWARD, CRM_INLINE_VARIATION, DEFAULT_CRM_DATA, ICrmPageConfig } from "../../service/crm-promotion/crm-token"

export function provideCreatePromotionConfig(path: string): ICrmPageConfig {
    switch (path) {
        case "create-bill":
            return {
                pageName: "ส่วนลดท้ายบิล",
                initialData: {
                    ...DEFAULT_CRM_DATA, ...CRM_BILL_VARIATION,
                },
                filterOption: {
                    showFilter: false,
                    showBundle: false,
                    showItem: false,
                    showList: false
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
                    ...DEFAULT_CRM_DATA, ...CRM_BUNDLE_VARIATION
                },
                filterOption: {
                    showFilter: true,
                    showBundle: true,
                    showItem: false,
                    showList: true
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
                    ...DEFAULT_CRM_DATA, ...CRM_INLINE_VARIATION
                },
                filterOption: {
                    showFilter: true,
                    showBundle: false,
                    showItem: true,
                    showList: false
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
