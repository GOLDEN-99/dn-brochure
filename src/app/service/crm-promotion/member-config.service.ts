import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { TMember } from '../../types/crm-promotion.type';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class MemberConfigService {

  private readonly api = inject(ApiService)
  private readonly basePath = environment.oi + '/crm'

  allMember$ = this.api.get<TMember[]>(`${this.basePath}/member-types`)
  allMember = toSignal(this.allMember$, { initialValue: [] })

}
