import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { IBOBCOMPLIST_TOKEN } from '../../service/ibob/ibobToken';
import { IbobAddService } from '../../service/ibob/reserve/ibob-add.service';

@Component({
  selector: 'app-in-out-nav',
  imports: [RouterOutlet, RouterLink],
  providers: [
    { provide: IBOBCOMPLIST_TOKEN, useExisting: IbobAddService }
  ],
  templateUrl: './in-out-nav.component.html',
  styleUrl: './in-out-nav.component.scss'
})
export class InOutNavComponent {
  private serv = inject(IBOBCOMPLIST_TOKEN)
  warehouseList = this.serv.warehouseList
}
