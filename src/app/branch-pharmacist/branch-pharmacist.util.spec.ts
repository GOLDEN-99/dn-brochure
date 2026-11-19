import { HttpErrorResponse } from '@angular/common/http';
import { TBranchFilter, TBranchPharmacist, TPharmacistCandidate } from './branch-pharmacist.types';
import { apiErrorMessage, CANDIDATE_PAGE_SIZE, filterBranches, isReady, searchCandidates, summarize } from './branch-pharmacist.util';

const branch = (code: string, over: Partial<TBranchPharmacist> = {}): TBranchPharmacist => ({
  branchCode: code, branchName: 'สาขา ' + code, isGpp: false,
  licenceNo: null, licenceUpdatedBy: null, licenceUpdatedAt: null,
  assignmentId: null, pharmacistCode: null, pharmacistName: null, pharmacistEligible: null,
  assignedAt: null, assignedBy: null,
  ...over,
})

const assigned = { assignmentId: 1, pharmacistCode: '2001', pharmacistName: 'ภญ. สมศรี', pharmacistEligible: true }

const BRANCHES = [
  branch('1', { licenceNo: 'ขย.1/2569', ...assigned }),                              // ready
  branch('2', { licenceNo: 'ขย.2/2569' }),                                            // no pharmacist
  branch('3', { ...assigned, pharmacistCode: '2002', pharmacistName: 'ภก. สมชาย' }), // no licence
  branch('4', { licenceNo: 'ขย.4/2569', ...assigned, pharmacistEligible: false }),   // pharmacist left
]

describe('branch-pharmacist util', () => {
  it('counts a branch as ready only with a licence and an eligible pharmacist', () => {
    expect(BRANCHES.map(isReady)).toEqual([true, false, false, false])
    expect(summarize(BRANCHES)).toEqual({ total: 4, ready: 1, noPharmacist: 1, noLicence: 1, review: 1 })
  })

  it('filters by gap', () => {
    const codes = (f: TBranchFilter) => filterBranches(BRANCHES, '', f).map(b => b.branchCode)
    expect(codes('all')).toEqual(['1', '2', '3', '4'])
    expect(codes('incomplete')).toEqual(['2', '3', '4'])
    expect(codes('noPharmacist')).toEqual(['2'])
    expect(codes('noLicence')).toEqual(['3'])
    expect(codes('review')).toEqual(['4'])
  })

  it('searches branch, licence and pharmacist text, within the active filter', () => {
    expect(filterBranches(BRANCHES, ' สมชาย ', 'all').map(b => b.branchCode)).toEqual(['3'])
    expect(filterBranches(BRANCHES, 'ขย.4', 'all').map(b => b.branchCode)).toEqual(['4'])
    expect(filterBranches(BRANCHES, '2001', 'incomplete').map(b => b.branchCode)).toEqual(['4'])
  })

  it('pages the picker and leaves out the pharmacist already at the branch', () => {
    const candidates: TPharmacistCandidate[] = Array.from({ length: 30 }, (_, i) => ({
      emplCode: String(3000 + i), emplName: 'เภสัช ' + i, emplGroupCode: 6, homeBranchCode: null, activeBranchCount: 0,
    }))
    const all = searchCandidates(candidates, '', '3000')
    expect(all.total).toBe(29)
    expect(all.rows.length).toBe(CANDIDATE_PAGE_SIZE)
    expect(all.rows[0].emplCode).toBe('3001')
    expect(searchCandidates(candidates, '3029', null).rows.map(c => c.emplCode)).toEqual(['3029'])
    expect(searchCandidates(candidates, 'เภสัช 7', null).total).toBe(1)
  })

  it('prefers the per-field message of a 400, then the message of a 404', () => {
    const bad = new HttpErrorResponse({ status: 400, error: { message: 'Validation failed', errors: { pharmacistCode: ['ไม่ได้อยู่ในกลุ่มเภสัชกร'] } } })
    const missing = new HttpErrorResponse({ status: 404, error: { message: 'ไม่พบสาขา 999' } })
    expect(apiErrorMessage(bad)).toBe('ไม่ได้อยู่ในกลุ่มเภสัชกร')
    expect(apiErrorMessage(missing)).toBe('ไม่พบสาขา 999')
    expect(apiErrorMessage(new HttpErrorResponse({ status: 0 }))).toBeNull()
    expect(apiErrorMessage(new HttpErrorResponse({ status: 400, error: { message: 'Validation failed' } }))).toBeNull()
  })
})
