import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { IBOBRESERVE_TOKEN } from '../../../service/ibob/ibobToken';
import { IbobAddService } from '../../../service/ibob/ibob-add.service';
import { TMaybe } from '../../../types';
import { TDoor } from '../../../types/ibob-supplier.type';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DoorService } from '../../../service/ibob/door.service';
import { WarehouseService } from '../../../service/ibob/warehouse.service';
import { ToastService } from '../../../service/toast/toast.service';

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
  private toastServ = inject(ToastService)

  private doorService = inject(DoorService)

  today = inject(NgbCalendar).getToday();
  activeDate = signal<TMaybe<NgbDate>>(null)
  activeSlot = signal<string[]>([])
  lowerBound = computed(() => {
    const slots = this.activeSlot()
    if (slots.length === 0) return null
    const min = slots[0]
    return this.minusMin(min)
  })
  upperBound = computed(() => {
    const slots = this.activeSlot()
    if (slots.length === 0) return null
    const max = slots[slots.length - 1]
    return this.addMin(max)
  })
  isMultiple = signal<TMaybe<string>>(null)

  updateActiveSlot = (value: string) => {
    const slots = this.activeSlot()
    const idx = slots.findIndex(a => a === value)
    if (idx !== -1) {
      if (idx === 0 || idx === slots.length - 1) {
        this.activeSlot.update(prev => prev.filter((_, i) => i !== idx))
        return
      }
      this.toastServ.danger('ไม่สามารถเอาเวลาตรงกลางออกได้')
      return
    }

    const mode = this.isMultiple()
    switch (mode) {
      case "0":
        this.activeSlot.set([value])
        break
      case "1":
        const upper = this.upperBound()
        const lower = this.lowerBound()
        if (!upper || !lower) {
          this.activeSlot.set([value])
          return
        }
        if (value === lower) {
          this.activeSlot.update(p => [value, ...p])
          return
        }
        if (value === upper) {
          this.activeSlot.update(p => [...p, value])
          return
        }
        this.toastServ.danger('กรุณาเลือกช่วงเวลาที่ติดกัน')
        break
      default: throw new Error('unsupport mode')
    }
  }

  private serv = inject(IBOBRESERVE_TOKEN)

  btnClass = (cur: string) => this.activeSlot().some(a => a === cur) ? 'btn btn-success' : 'btn btn-outline-secondary'

  activeDoor = signal<TMaybe<string>>(null)
  minBox = signal(0)
  maxBox = signal(0)
  useTime = signal(0)

  onChangeGate(arg: TDoor) {
    this.activeDoor.set(arg.doorId)
    this.serv.changeGate(arg.doorId)
    this.isMultiple.set(arg.multiple)
    this.activeSlot.set([])
    this.minBox.set(arg.minBox)
    this.maxBox.set(arg.maxBox)
    this.useTime.set(arg.timeUse)
  }

  onChangeDate(date: NgbDate) {
    this.activeDate.set(date)
    this.serv.changeDate(date)
  }

  comp = this.serv.currentComp
  doorList = this.doorService.doorList
  possibleSlot = this.serv.possibleSlot


  private convertToStruct = (clockTime: string) => {
    const [hour, min] = clockTime.split(':').map(Number)
    return { hour, min }
  }

  private convertToStr = ({ hour, min }: { hour: number, min: number }) => {
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
  }

  private addMin = (clockTime: string) => {
    const { hour, min } = this.convertToStruct(clockTime)
    const useTime = this.useTime()
    const nextMin = min + useTime
    const validMin = nextMin < 60 ? nextMin : nextMin - 60
    const validHour = nextMin < 60 ? hour : hour + 1
    return this.convertToStr({ hour: validHour, min: validMin })
  }

  private minusMin = (clockTime: string) => {
    const { hour, min } = this.convertToStruct(clockTime)
    const useTime = this.useTime()
    const nextMin = min - useTime
    const validMin = nextMin >= 0 ? nextMin : nextMin + 60
    const validHour = nextMin >= 0 ? hour : hour - 1
    return this.convertToStr({ hour: validHour, min: validMin })
  }

  poList = this.serv.orderList
  checkPo = this.serv.checkOrder
  changeBox = this.serv.changeOrderAmount
  totalBox = computed(
    () => this.poList()
      .reduce((acc, cur) => cur.check ? acc + cur.box : acc, 0)
  )

  tooLow = computed(() => this.totalBox() < this.minBox())
  tooHigh = computed(() => {
    const total = this.totalBox()
    const max = this.maxBox()
    return total > max * this.activeSlot().length
  })

  disableSubmit = computed(() => {
    const total = this.totalBox()
    return total === 0 || this.tooLow() || this.tooHigh()
  })

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
