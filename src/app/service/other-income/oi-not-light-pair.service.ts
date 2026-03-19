import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';

export type TPairItem = {
  id: number
  displayName: string
  createdAt: string
  dnHeadId: number | null
  dnCompCode: string | null
  huHeadId: number | null
  huCompCode: string | null
}

@Injectable({
  providedIn: 'root'
})
export class OiNotLightPairService {
  private readonly api = inject(ApiService)
  private readonly url = environment.oi

  getAll() {
    return this.api.get<TPairItem[]>(`${this.url}/other-income/pair`)
  }

  create(displayName: string) {
    return this.api.post<{ id: number }>(`${this.url}/other-income/pair`, { displayName })
  }
}
