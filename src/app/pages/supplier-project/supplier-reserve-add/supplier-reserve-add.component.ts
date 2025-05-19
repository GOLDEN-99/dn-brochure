import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { IBOBRESERVE_TOKEN } from '../../../service/ibob/ibobToken';
import { IbobAddService } from '../../../service/ibob/reserve/ibob-add.service';
import { TMaybe } from '../../../types';
import { TDoor } from '../../../types/ibob-supplier.type';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DoorService } from '../../../service/ibob/door.service';
import { WarehouseService } from '../../../service/ibob/warehouse.service';

@Component({
  selector: 'app-supplier-reserve-add',
  imports: [FormsModule, NgbDatepickerModule, RouterLink],
  providers: [
    { provide: IBOBRESERVE_TOKEN, useExisting: IbobAddService }
  ],
  templateUrl: './supplier-reserve-add.component.html',
  styleUrl: './supplier-reserve-add.component.scss'
})
export class SupplierReserveAddComponent {
  warehouse = input<string>()
  private warehouseServ = inject(WarehouseService)
  pageLabel = this.warehouseServ.currentWarehouseName
  private router = inject(Router)

  private doorService = inject(DoorService)

  today = inject(NgbCalendar).getToday();
  activeDate = signal<TMaybe<NgbDate>>(null)
  activeSlot = signal<string[]>([])
  isMultiple = signal<TMaybe<string>>(null)

  updateActiveSlot = (value: string) => {
    const isActive = this.activeSlot().some(a => a === value)
    if (isActive) {
      this.activeSlot.update(prev => prev.filter(p => p !== value))
      return
    }
    const mode = this.isMultiple()
    switch (mode) {
      case "0":
        this.activeSlot.set([value])
        break
      case "1":
        this.activeSlot.update((prev) => [...prev, value])
        break
      default: throw new Error('unsupport mode')
    }
  }

  private serv = inject(IBOBRESERVE_TOKEN)

  btnClass = (cur: string) => this.activeSlot().some(a => a === cur) ? 'btn btn-success' : 'btn btn-outline-secondary'

  activeDoor = signal<TMaybe<string>>(null)

  onChangeGate({ doorId, multiple }: TDoor) {
    this.activeDoor.set(doorId)
    this.serv.changeGate(doorId)
    this.isMultiple.set(multiple)
    this.activeSlot.set([])
  }

  onChangeDate(date: NgbDate) {
    this.activeDate.set(date)
    this.serv.changeDate(date)
  }

  comp = this.serv.currentComp
  doorList = this.doorService.doorList
  possibleSlot = this.serv.possibleSlot
  poList = this.serv.orderList
  checkPo = this.serv.checkOrder
  changeBox = this.serv.changeOrderAmount
  totalBox = computed(
    () => this.poList()
      .reduce((acc, cur) => cur.check ? acc + cur.box : acc, 0)
  )
  note = signal('')
  handleSubmit = () => {
    const date = this.activeDate()
    if (!date) throw new Error('no current date')
    const reservationDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
    const doorId = this.activeDoor()
    const note = this.note()
    if (!doorId) throw new Error('no current door')
    const partialAppliedReservation = (reservationTime: string) => this.serv.createReservation({ reservationDate, reservationTime, doorId, note })
    const timeSlot = this.activeSlot()
    const cmdList = timeSlot.map(partialAppliedReservation)
    forkJoin(cmdList).subscribe({
      next: res => {
        res.forEach(console.log)
        this.router.navigateByUrl('supplier/reserve')
      },
      error: (err) => { console.error(err); }
    })
  }
}
