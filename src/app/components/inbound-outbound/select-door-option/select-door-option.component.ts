import { Component, effect, inject, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DoorService } from '../../../service/ibob/door.service';
import { TMaybe } from '../../../types';
import { TAppDoor, TAppDoorProp } from '../../../types/ibob-supplier.type';


let runningId = 0

@Component({
  selector: 'app-select-door-option',
  imports: [FormsModule],
  templateUrl: './select-door-option.component.html',
  styleUrl: './select-door-option.component.scss'
})
export class SelectDoorOptionComponent {
  id: number = 0
  constructor() {
    this.id = runningId++
  }
  private doorService = inject(DoorService)
  readOnly = input(false)
  doorList = this.doorService.doorList
  activeDoor = input<TMaybe<TAppDoorProp>>(null)
  activeDoorChange = output<TAppDoorProp>()
  onChangeGate(door: TAppDoor) {
    this.activeDoorChange.emit(door)
  }
}
