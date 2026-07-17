import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TBranchDetail, TConfigGroup, TBranchGroupDetail, TBranchZoneDetail } from '../../types/crm-promotion.type';
import { switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchConfigService {

  private readonly api = inject(ApiService)
  private readonly basePath = environment.oi + '/crm'

  private readonly refetchBranchGroupSig = signal(0)
  private readonly refetchBranchGroup$ = toObservable(this.refetchBranchGroupSig)
  private readonly allBranches$ = this.api.get<TBranchDetail[]>(`${this.basePath}/all-branches`)
  allBranches = toSignal(this.allBranches$, { initialValue: [] })
  private readonly allBranchGroup$ = this.refetchBranchGroup$.pipe(
    switchMap(() => this.api.get<TConfigGroup[]>(`${this.basePath}/promotion-branch-groups`))
  )
  allBranchGroup = toSignal(this.allBranchGroup$, { initialValue: [] })
  hasBranchGroup = (name: string) => {
    const cleanName = name.trim().toLocaleLowerCase();
    return this.allBranchGroup().some(group => group.name.toLowerCase() === cleanName)
  }
  createBranchGroup(req: { name: string }) {
    return this.api.post<{ id: number }>(`${this.basePath}/promotion-branch-groups`, req)
  }
  refetchBranchGroup() {
    this.refetchBranchGroupSig.update(v => v + 1)
  }
  private readonly allBranchZone$ = this.api.get<TBranchZoneDetail[]>(`${this.basePath}/branch-zones`)
  allBranchZone = toSignal(this.allBranchZone$, { initialValue: [] })

  private readonly allOldBranchGroup$ = this.api.get<TBranchGroupDetail[]>(`${this.basePath}/branch-groups`)
  allOldBranchGroup = toSignal(this.allOldBranchGroup$, { initialValue: [] })

  getByGroupId(groupId: number) {
    return this.api.get<TBranchDetail[]>(`${this.basePath}/promotion-branch-groups/${groupId}/items`)
  }

  addBranchesToGroup(groupId: number, branchCodes: string[]) {
    return this.api.post<void>(`${this.basePath}/promotion-branch-groups/${groupId}/items/batch`, { branchCodes })
  }

  deleteBranchFromGroup(listId: number) {
    return this.api.delete(`${this.basePath}/promotion-branch-groups/items/${listId}`)
  }

}
