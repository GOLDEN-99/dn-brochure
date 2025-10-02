import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IbobAddService } from '../../../service/ibob/ibob-add.service';
import { WarehouseService } from '../../../service/ibob/warehouse.service';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DateInputComponent } from "../../../components/date-input/date-input.component";
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-supplier-reserve',
  imports: [RouterLink, DateInputComponent, DatePipe],
  templateUrl: './supplier-reserve.component.html',
  styleUrl: './supplier-reserve.component.scss'
})
export class SupplierReserveComponent {
  private serv = inject(IbobAddService)
  compInfo = this.serv.currentComp
  private whServ = inject(WarehouseService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  warehouseList = this.whServ.warehouseList
  fromDate = this.serv.fromDate
  toDate = this.serv.toDate
  compCode$ = this.route.queryParamMap.pipe(map(queryMap => queryMap.get('compCode')))
  compCode = toSignal(this.compCode$, { initialValue: null })
  reservationList = this.serv.reservationList
  createUrl(warehouseid: string) {
    const routeSnapshot = this.route.snapshot
    const queryParams = routeSnapshot.queryParams
    return this.router.createUrlTree(['add', warehouseid], { relativeTo: this.route, queryParams })
  }
}
