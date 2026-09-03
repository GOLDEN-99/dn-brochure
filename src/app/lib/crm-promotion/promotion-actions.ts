// Reward-action identifiers that code branches on, kept in a module of their own: the
// page config, the form schema and the request builder all need them, and the config
// already imports the schema's form type, so declaring them beside the config would
// close an import cycle.
//
// ⚠️ Naming rule for anything added here. DrugPos routes actions by SUFFIX --
// CrmPromotionEngine tests EndsWith on GIFT, PWP, PERCENTDISC, BATHDISC and PRICE --
// so a name ending in one of those is silently handled as that other action, with no
// error anywhere. The API adds a second rule: it caps every tier's rewardValue at 100
// for any action *containing* PERCENT. Check a new name against both.

// Puts the register-fee SKU on the bill at 0 baht. The vendor service reads that line
// to promote a customer from custType 17 (LineCRM) to 6 (HUG Club).
export const REGISTER_FEE_ACTION = 'REGISTERFEE';

// The N cheapest units of the bundle become free, N authored per tier.
export const CHEAPEST_ACTION = 'CHEAPEST';

// ค่าสมัครสมาชิก HUG Club. The only SKU a REGISTERFEE promotion ever carries, which is
// why its reward pool is derived at submit rather than authored.
export const REGISTER_FEE_GOOD_CODE = '11755';
