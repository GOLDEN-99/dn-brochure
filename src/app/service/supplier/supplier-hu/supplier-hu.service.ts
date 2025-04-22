import { inject, Injectable, Signal, signal } from '@angular/core';
import { ISupplierList } from '../../../lib';
import { TSupplierItem } from '../../../types';
import { ApiService } from '../../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class SupplierHuService implements ISupplierList {

  constructor() { }

  private api = inject(ApiService)
  data = signal<TSupplierItem[]>([{
    username: 'test',
    password: 'test',
    supName: 'sup A',
    email: 'supA@test.com',
    address: 'อาคารสำนักงานใหญ่ เลขที่ 26/56-57 ซอย, 62/2 King Kaeo Rd, Racha Thewa, Bang Phli District, Samut Prakan 10540',
    tel: '0888888888'
  }])
  pageLabel: Signal<'DN' | 'HU'> = signal('HU')
}
