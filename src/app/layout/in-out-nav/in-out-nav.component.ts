import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IBOBCOMPLIST_TOKEN } from '../../service/ibob/ibobToken';
import { IbobAddService } from '../../service/ibob/reserve/ibob-add.service';
import { WarehouseService } from '../../service/ibob/warehouse.service';

@Component({
  selector: 'app-in-out-nav',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './in-out-nav.component.html',
  styleUrl: './in-out-nav.component.scss'
})
export class InOutNavComponent {
  private warehouseServ = inject(WarehouseService)
  warehouseList = this.warehouseServ.warehouseList
}
