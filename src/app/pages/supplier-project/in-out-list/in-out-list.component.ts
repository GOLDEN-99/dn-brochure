import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DoorService } from '../../../service/ibob/door.service';

@Component({
  selector: 'app-in-out-list',
  imports: [RouterLink],
  templateUrl: './in-out-list.component.html',
  styles: ''
})
export class InOutListComponent {
  private route = inject(ActivatedRoute)
  private router = inject(Router)

  goTo(idx: number | string) {
    this.router.navigate([idx], { relativeTo: this.route })
  }


  private serv = inject(DoorService)
  doorList = this.serv.doorList

}
