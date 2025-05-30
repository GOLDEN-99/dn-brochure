import { Component, inject } from '@angular/core';
import { DoorService } from '../../../service/ibob/door.service';
import { DoorMutationService } from '../../../service/ibob/door-mutation.service';

@Component({
  selector: 'app-in-out-detail',
  imports: [],
  templateUrl: './in-out-detail.component.html',
  styleUrl: './in-out-detail.component.scss'
})
export class InOutDetailComponent {
  private doorMutServ = inject(DoorMutationService)
  id = this.doorMutServ.doorId
}
