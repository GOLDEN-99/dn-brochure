import { CRM_BILL_VARIATION, CRM_CATEGORY_VARIATION, CRM_FIX_BUNDLE_VARIATION, CRM_PICK_BUNDLE_VARIATION, CRM_PWP_VARIATION, DEFAULT_CRM_DATA, ICrmPageCongif } from "../../service/crm-promotion/crm-token"

export function provideCreatePromotionConfig(path: string): ICrmPageCongif {
    switch (path) {
        case "create-bill":
            return {
                pageName: "ส่วนลดท้ายบิล",
                initialData: {
                    ...DEFAULT_CRM_DATA, ...CRM_BILL_VARIATION,
                }
            }
        case "create-category":
            return {
                pageName: "ส่วนลดตามกลุ่ม",
                initialData: {
                    ...DEFAULT_CRM_DATA, ...CRM_CATEGORY_VARIATION
                }
            }
        case "create-fix":
            return {
                pageName: "ซื้อคู่",
                initialData: {
                    ...DEFAULT_CRM_DATA, ...CRM_FIX_BUNDLE_VARIATION
                }
            }
        case "create-pick":
            return {
                pageName: "ซื้อคละ",
                initialData: {
                    ...DEFAULT_CRM_DATA, ...CRM_PICK_BUNDLE_VARIATION
                }
            }
        case "create-pwp":
            return {
                pageName: "สิทธิแลกซื้อ",
                initialData: {
                    ...DEFAULT_CRM_DATA, ...CRM_PWP_VARIATION
                }
            }
        default:
            throw new Error("invalid path name")
    }
}
