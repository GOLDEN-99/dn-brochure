// Mirrors other-income-api Entity/BranchPharmacistEntity.cs (camelCased by the API's JSON options).

/** One selling branch with its drug-sale licence and its active pharmacist; either may be missing. */
export type TBranchPharmacist = {
  branchCode: string
  branchName: string
  isGpp: boolean
  licenceNo: string | null
  licenceUpdatedBy: string | null
  licenceUpdatedAt: string | null
  assignmentId: number | null
  pharmacistCode: string | null
  pharmacistName: string | null
  /** false = the assigned pharmacist has left or is no longer in a pharmacist group; null = nobody assigned. */
  pharmacistEligible: boolean | null
  assignedAt: string | null
  assignedBy: string | null
}

/** One assignment period. endedAt null = the active one. */
export type TBranchPharmacistPeriod = {
  id: number
  branchCode: string
  pharmacistCode: string
  pharmacistName: string | null
  assignedAt: string
  endedAt: string | null
  assignedBy: string
  assignedByName: string | null
  endedBy: string | null
  endedByName: string | null
}

export type TPharmacistCandidate = {
  emplCode: string
  emplName: string
  emplGroupCode: number
  homeBranchCode: string | null
  /** Branches this person is the active pharmacist of right now. */
  activeBranchCount: number
}

export type TBranchFilter = 'all' | 'incomplete' | 'noPharmacist' | 'noLicence' | 'review'

export type TBranchSummary = {
  total: number
  ready: number
  noPharmacist: number
  noLicence: number
  review: number
}

/** EmplGroupInfo names of the groups the POS accepts as a pharmacist (PharmacistRule in DrugPOSApp). */
export const PHARMACIST_GROUP_LABEL: Record<number, string> = {
  5: 'Full Time',
  6: 'Part Time',
  35: 'Management',
  36: 'Supporting',
  37: 'Branch Manager',
}

export const LICENCE_NO_MAX_LENGTH = 30
