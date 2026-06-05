import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class OtherIncomePurchaseApiService {
  private readonly api = inject(ApiService)


}
