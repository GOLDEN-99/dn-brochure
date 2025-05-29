import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IBOBCOMPLIST_TOKEN } from '../../../service/ibob/ibobToken';
import { IbobAddService } from '../../../service/ibob/ibob-add.service';
@Component({
  selector: 'app-supplier-reserve',
  imports: [RouterLink],
  providers: [
    {
      provide: IBOBCOMPLIST_TOKEN,
      useExisting: IbobAddService
    }
  ],
  templateUrl: './supplier-reserve.component.html',
  styleUrl: './supplier-reserve.component.scss'
})
export class SupplierReserveComponent {
  data = [
    {
      date: '2024-01-01',
      time: '11:00-11:30',
      list: ['po123456789', 'po223456789'],
      total: 2,
      address: 'อาคารสำนักงานใหญ่ เลขที่ 26/56-57 ซอย, 62/2 King Kaeo Rd, Racha Thewa, Bang Phli District, Samut Prakan 10540'
    }
  ]
  private serv = inject(IBOBCOMPLIST_TOKEN)
  warehouseList = this.serv.warehouseList
}
