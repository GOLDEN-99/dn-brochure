import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TBranchDetail, } from '../../types/crm-promotion.type';
import { switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrmGroupService {



}
