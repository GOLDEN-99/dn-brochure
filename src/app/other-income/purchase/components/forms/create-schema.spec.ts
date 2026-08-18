import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {
    mapBranchContractFormToCreateReq,
    mapPromoContractFormToCreateReq,
    mapOrderContractFormToCreateReq,
    TCreateBranchContractForm,
    TCreatePromoContractForm,
    TCreateOrderContractForm,
    TContractHeadForm,
} from './create-schema';
import { TContractLabel } from '../../../shared/types/other-income.type';

const dateStruct = (year: number, month: number, day: number): NgbDateStruct => ({ year, month, day });

const contractLabel: TContractLabel = { id: 7, eventName: 'test event', eventType: 'BRANCH' };

const baseHead: TContractHeadForm = {
    settlementPeriod: 3,
    contractLabel,
    dateRange: { startDate: dateStruct(2026, 1, 1), endDate: dateStruct(2026, 12, 31) },
    bill: null,
    freeItem: null,
    invoice: null,
    creditNote: null,
};

describe('mapBranchContractFormToCreateReq', () => {
    it('maps DN company code when compType is DN', () => {
        const state: TCreateBranchContractForm = {
            head: baseHead,
            comp: {
                compType: 'DN',
                dnComp: { compCode: 'DN001', compName: 'DN Co', compName2: '' },
                huComp: { compCode: 'HU001', compName: 'HU Co', compName2: '' },
            },
            branchSpec: { maxBranches: 10, maxIncome: 1200 },
        };

        const req = mapBranchContractFormToCreateReq(state);

        expect(req.compCode).toBe('DN001');
        expect(req.compType).toBe('DN');
        expect(req.startDate).toBe('2026-01-01');
        expect(req.endDate).toBe('2026-12-31');
        expect(req.contractLabelId).toBe(7);
        expect(req.settlementPeriod).toBe(3);
    });

    it('maps HU company code when compType is HU', () => {
        const state: TCreateBranchContractForm = {
            head: baseHead,
            comp: {
                compType: 'HU',
                dnComp: { compCode: 'DN001', compName: 'DN Co', compName2: '' },
                huComp: { compCode: 'HU001', compName: 'HU Co', compName2: '' },
            },
            branchSpec: { maxBranches: 10, maxIncome: 1200 },
        };

        const req = mapBranchContractFormToCreateReq(state);

        expect(req.compCode).toBe('HU001');
        expect(req.compType).toBe('HU');
    });

    it('derives ratePerBranch from maxIncome / maxBranches, rounded to 2 decimals', () => {
        const state: TCreateBranchContractForm = {
            head: baseHead,
            comp: {
                compType: 'DN',
                dnComp: { compCode: 'DN001', compName: '', compName2: '' },
                huComp: { compCode: '', compName: '', compName2: '' },
            },
            branchSpec: { maxBranches: 3, maxIncome: 1000 },
        };

        const req = mapBranchContractFormToCreateReq(state);

        // 1000 / 3 = 333.333... -> rounds to 333.33
        expect(req.ratePerBranch).toBe(333.33);
    });

    it('resolves income types only for selected labels', () => {
        const state: TCreateBranchContractForm = {
            head: {
                ...baseHead,
                bill: { id: 11, incomeName: 'bill label', incomeType: 'Bill' },
                creditNote: { id: 12, incomeName: 'credit note label', incomeType: 'CreditNote' },
            },
            comp: {
                compType: 'DN',
                dnComp: { compCode: 'DN001', compName: '', compName2: '' },
                huComp: { compCode: '', compName: '', compName2: '' },
            },
            branchSpec: { maxBranches: 10, maxIncome: 1200 },
        };

        const req = mapBranchContractFormToCreateReq(state);

        expect(req.incomeTypes).toEqual([
            { incomeType: 'Bill', incomeLabelId: 11 },
            { incomeType: 'CreditNote', incomeLabelId: 12 },
        ]);
    });
});

describe('mapPromoContractFormToCreateReq', () => {
    it('maps DN company code and omits spec fields', () => {
        const state: TCreatePromoContractForm = {
            head: baseHead,
            comp: {
                compType: 'DN',
                dnComp: { compCode: 'DN001', compName: 'DN Co', compName2: '' },
                huComp: { compCode: 'HU001', compName: 'HU Co', compName2: '' },
            },
        };

        const req = mapPromoContractFormToCreateReq(state);

        expect(req.compCode).toBe('DN001');
        expect(req.compType).toBe('DN');
        expect(req.contractLabelId).toBe(7);
        expect((req as any).spec).toBeUndefined();
    });

    it('resolves income types only for selected labels', () => {
        const state: TCreatePromoContractForm = {
            head: {
                ...baseHead,
                bill: { id: 11, incomeName: 'bill label', incomeType: 'Bill' },
                creditNote: { id: 12, incomeName: 'credit note label', incomeType: 'CreditNote' },
            },
            comp: {
                compType: 'DN',
                dnComp: { compCode: 'DN001', compName: '', compName2: '' },
                huComp: { compCode: '', compName: '', compName2: '' },
            },
        };

        const req = mapPromoContractFormToCreateReq(state);

        expect(req.incomeTypes).toEqual([
            { incomeType: 'Bill', incomeLabelId: 11 },
            { incomeType: 'CreditNote', incomeLabelId: 12 },
        ]);
    });

    it('maps HU company code when compType is HU', () => {
        const state: TCreatePromoContractForm = {
            head: baseHead,
            comp: {
                compType: 'HU',
                dnComp: { compCode: 'DN001', compName: '', compName2: '' },
                huComp: { compCode: 'HU001', compName: '', compName2: '' },
            },
        };

        const req = mapPromoContractFormToCreateReq(state);

        expect(req.compCode).toBe('HU001');
        expect(req.compType).toBe('HU');
    });
});

describe('mapOrderContractFormToCreateReq', () => {
    const orderHead: TContractHeadForm = { ...baseHead, contractLabel: { id: 1, eventName: 'order event', eventType: 'ORDER' } };

    it('resolves income types only for selected labels', () => {
        const state: TCreateOrderContractForm = {
            head: {
                ...orderHead,
                bill: { id: 11, incomeName: 'bill label', incomeType: 'Bill' },
                freeItem: null,
                invoice: null,
                creditNote: { id: 12, incomeName: 'cn label', incomeType: 'CreditNote' },
            },
            comp: {
                compType: 'DN',
                dnComp: { comp: { compCode: 'DN001', compName: '', compName2: '' }, products: [{ goodCode: 'G1', goodName: '', barCode: '' }] },
                huComp: { comp: { compCode: '', compName: '', compName2: '' }, products: [] },
            },
            excludeFlags: { excludeDc: false, excludeRebate: false, excludeComp: false, excludeInce: false, excludeVat: false },
            calcSpec: {
                cap: { isCap: false, capAmount: 0 },
                calcType: 'Flat',
                bracketSteps: [],
                singleStep: { min: 0, rate: 3 },
            },
        };

        const req = mapOrderContractFormToCreateReq(state);

        expect(req.incomeTypes).toEqual([
            { incomeType: 'Bill', incomeLabelId: 11 },
            { incomeType: 'CreditNote', incomeLabelId: 12 },
        ]);
        expect(req.productGoodCodes).toEqual(['G1']);
    });

    it('builds a single flat step from singleStep when calcType is Flat', () => {
        const state: TCreateOrderContractForm = {
            head: orderHead,
            comp: {
                compType: 'DN',
                dnComp: { comp: { compCode: 'DN001', compName: '', compName2: '' }, products: [] },
                huComp: { comp: { compCode: '', compName: '', compName2: '' }, products: [] },
            },
            excludeFlags: { excludeDc: false, excludeRebate: false, excludeComp: false, excludeInce: false, excludeVat: false },
            calcSpec: {
                cap: { isCap: false, capAmount: 0 },
                calcType: 'Flat',
                bracketSteps: [],
                singleStep: { min: 0, rate: 3 },
            },
        };

        const req = mapOrderContractFormToCreateReq(state);

        expect(req.steps).toEqual([{ min: 0, max: null, rate: 3 }]);
    });

    it('derives max from the next step min for Step/Cumulative brackets', () => {
        const state: TCreateOrderContractForm = {
            head: orderHead,
            comp: {
                compType: 'DN',
                dnComp: { comp: { compCode: 'DN001', compName: '', compName2: '' }, products: [] },
                huComp: { comp: { compCode: '', compName: '', compName2: '' }, products: [] },
            },
            excludeFlags: { excludeDc: false, excludeRebate: false, excludeComp: false, excludeInce: false, excludeVat: false },
            calcSpec: {
                cap: { isCap: false, capAmount: 0 },
                calcType: 'Step',
                bracketSteps: [
                    { min: 0, rate: 1 },
                    { min: 1000000, rate: 2 },
                    { min: 2000000, rate: 3 },
                ],
                singleStep: { min: 0, rate: 0 },
            },
        };

        const req = mapOrderContractFormToCreateReq(state);

        expect(req.steps).toEqual([
            { min: 0, max: 1000000, rate: 1 },
            { min: 1000000, max: 2000000, rate: 2 },
            { min: 2000000, max: null, rate: 3 },
        ]);
    });
});
