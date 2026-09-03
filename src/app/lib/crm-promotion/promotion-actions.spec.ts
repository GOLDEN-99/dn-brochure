import {
  CHEAPEST_ACTION,
  REGISTER_FEE_ACTION,
  REGISTER_FEE_GOOD_CODE,
} from './promotion-actions';

// DrugPos's CrmPromotionEngine dispatches on Action.EndsWith(...) for these five, so an
// action name ending in one of them is silently executed as that other action — no
// error at the till, no error here. The API separately caps tier rewardValue at 100 for
// any action containing PERCENT, which would quietly clamp a count-based reward.
const POS_ROUTED_SUFFIXES = ['GIFT', 'PWP', 'PERCENTDISC', 'BATHDISC', 'PRICE'];

describe('promotion actions', () => {
  const actions = [REGISTER_FEE_ACTION, CHEAPEST_ACTION];

  it('has the agreed identifiers', () => {
    expect(REGISTER_FEE_ACTION).toBe('REGISTERFEE');
    expect(CHEAPEST_ACTION).toBe('CHEAPEST');
    expect(REGISTER_FEE_GOOD_CODE).toBe('11755');
  });

  for (const action of actions) {
    it(`${action} does not end in a suffix the POS engine routes on`, () => {
      const clash = POS_ROUTED_SUFFIXES.find((s) => action.endsWith(s));
      expect(clash)
        .withContext(`${action} would be executed as ${clash} at the till`)
        .toBeUndefined();
    });

    it(`${action} does not contain PERCENT`, () => {
      expect(action).not.toContain('PERCENT');
    });

    it(`${action} fits the action column`, () => {
      // crm_promotions.action is NVARCHAR(50)
      expect(action.length).toBeLessThanOrEqual(50);
    });
  }
});
