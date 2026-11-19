import { HttpErrorResponse } from '@angular/common/http';
import { TBranchFilter, TBranchPharmacist, TBranchSummary, TPharmacistCandidate } from './branch-pharmacist.types';

/** A branch can print the ข.ย. registers only with a pharmacist; the licence also feeds the drug label. */
export const isReady = (b: TBranchPharmacist) =>
  !!b.licenceNo && !!b.pharmacistCode && b.pharmacistEligible !== false

export function summarize(branches: readonly TBranchPharmacist[]): TBranchSummary {
  return {
    total: branches.length,
    ready: branches.filter(isReady).length,
    noPharmacist: branches.filter(b => !b.pharmacistCode).length,
    noLicence: branches.filter(b => !b.licenceNo).length,
    review: branches.filter(b => b.pharmacistEligible === false).length,
  }
}

const matchesFilter = (b: TBranchPharmacist, filter: TBranchFilter) => {
  switch (filter) {
    case 'incomplete': return !isReady(b)
    case 'noPharmacist': return !b.pharmacistCode
    case 'noLicence': return !b.licenceNo
    case 'review': return b.pharmacistEligible === false
    default: return true
  }
}

/** Free-text match over branch code/name, licence number and the pharmacist's code/name. */
export function filterBranches(branches: readonly TBranchPharmacist[], keyword: string, filter: TBranchFilter): TBranchPharmacist[] {
  const q = keyword.trim().toLowerCase()
  return branches.filter(b => {
    if (!matchesFilter(b, filter)) return false
    if (!q) return true
    return [b.branchCode, b.branchName, b.licenceNo, b.pharmacistCode, b.pharmacistName]
      .some(v => (v ?? '').toLowerCase().includes(q))
  })
}

export const CANDIDATE_PAGE_SIZE = 20

/**
 * Picker search by employee code or name. There are ~1,200 candidates (mostly part-timers), so only the
 * first page is rendered; `total` tells the user to narrow the search.
 */
export function searchCandidates(candidates: readonly TPharmacistCandidate[], keyword: string, excludeCode: string | null) {
  const q = keyword.trim().toLowerCase()
  const matched = candidates.filter(c =>
    c.emplCode !== excludeCode
    && (!q || c.emplCode.toLowerCase().includes(q) || c.emplName.toLowerCase().includes(q)))
  return { rows: matched.slice(0, CANDIDATE_PAGE_SIZE), total: matched.length }
}

type TApiError = { message?: string; errors?: Record<string, string[]> | null }

/** The API's per-field Thai message when it sent one (400), else its message (404), else null. */
export function apiErrorMessage(err: unknown): string | null {
  const body = (err as HttpErrorResponse | undefined)?.error as TApiError | string | null | undefined
  if (!body || typeof body === 'string') return null
  const first = Object.values(body.errors ?? {}).find(messages => messages?.length)
  if (first) return first[0]
  return body.message && body.message !== 'Validation failed' ? body.message : null
}
