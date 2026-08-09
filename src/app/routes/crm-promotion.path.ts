/**
 * Leaf module on purpose: both crm-promotion.route.ts and CrmPromotionLayoutComponent need this
 * list, and importing it from either of those creates a cycle
 * (route → layout component → route), which breaks the Karma bundle with
 * "Cannot access 'CrmPromotionLayoutComponent' before initialization".
 * Keep this file free of imports.
 */
export const CREATE_ROUTE_PATH = [
    { path: "create-inline", name: 'ลดรายสินค้า', icon: 'bi bi-list-ul me-2' },
    { path: "create-bill", name: 'ส่วนลดท้ายบิล', icon: 'bi bi-receipt me-2' },
    { path: "create-group", name: 'ส่วนลดตามกลุ่มสินค้า', icon: 'bi bi-tags me-2' }
]
