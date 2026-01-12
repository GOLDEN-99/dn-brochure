import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, switchMap, tap } from 'rxjs';
import { getOrElse } from '../../../lib/utli';
import { TAppDoorProp, TAppOrder, TAppOrderState, TTimeSlot } from '../../../types/ibob-supplier.type';
import { NgbCalendar, NgbDate, NgbDatepicker, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IbobAddService } from '../../../service/ibob/ibob-add.service';
import { SelectDoorOptionComponent } from "../../../components/inbound-outbound/select-door-option/select-door-option.component";
import { FormsModule } from '@angular/forms';
import { TMaybe } from '../../../types';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IbobQueryReservationService } from '../../../service/ibob/ibob-query-reservation.service';
import { selectActiveDoor, selectComp, selectDriver, selectIsoDate, selectOrder, selectShortComp, selectSlot, selectTimeslotParams, TDriverData } from './lib';
import { convertToIso } from '../../../lib';

@Component({
  selector: 'app-ibob-admin-edit',
  imports: [SelectDoorOptionComponent, NgbDatepicker, FormsModule, RouterLink],
  templateUrl: './ibob-admin-edit.component.html',
  styleUrl: './ibob-admin-edit.component.scss'
})
export class IbobAdminEditComponent {
  private retryCnt = signal(0)
  refetch = () => this.retryCnt.update(prev => prev + 1)
  private retryCnt$ = toObservable(this.retryCnt)

  success = signal(true)
  isLoading = signal(true)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  backLink = this.router.createUrlTree(["..", "query"], { queryParamsHandling: "preserve", relativeTo: this.route })

  private query$ = this.route.queryParamMap
  private isAdmin$ = this.query$.pipe(map(q => q.get("adminCode") === '123456'), getOrElse(false))
  isAdmin = toSignal(this.isAdmin$, { initialValue: false })

  private urlParma$ = this.route.paramMap
    .pipe(
      map(p => p.get("reserveId")),
      filter(p => p !== null),
    )
  private reservationId$ = combineLatest([this.retryCnt$, this.urlParma$])
    .pipe(map(([_, id]) => id))
  private ibobQuery = inject(IbobQueryReservationService)
  private getById = this.ibobQuery.getSingleReservation
  private changeReservationData = this.ibobQuery.changeReservationData
  private searchTimeSlot = this.ibobQuery.searchTimeSlot
  private reservation$ = this.reservationId$.pipe(
    tap(() => this.isLoading.set(true)),
    switchMap(id => this.getById(id)),
    tap((res) => {
      this.isLoading.set(false);
      this.success.set(res !== null)
      const orders = res?.orderList ?? []
      let state: Record<string, number> = {}
      for (const order of orders) {
        state[order.orderNumb] = order.box;
      }
      this.orderState.set(state);
    }),
  )

  private reservationData = toSignal(this.reservation$, { initialValue: null })
  comp = computed(() => selectComp(this.reservationData()))
  activeDoor = computed(() => selectActiveDoor(this.reservationData()))
  orderList = computed(() => selectOrder(this.reservationData()))
  private minBox = computed(() => this.activeDoor()?.minBox ?? 0)
  private maxBox = computed(() => this.activeDoor()?.maxBox ?? 0)
  private isMultiple = computed(() => this.activeDoor()?.multiple === '1')
  driverForm = computed(() => selectDriver(this.reservationData()))

  private isoToNgbDate = (value: string) => {
    const [year, month, day] = value.split('T')[0].split('-').map(Number)
    return new NgbDate(year, month, day)
  }
  private calService = inject(NgbCalendar)
  private today = this.calService.getToday()
  selectDate = computed(() => this.isoToNgbDate(selectIsoDate(this.reservationData())))
  thaiDate = computed(() => { const { year, month, day } = this.selectDate(); return `${day}/${month}/${year}` })

  private searchTimeslotParam = computed<[string, string]>(() => selectTimeslotParams(this.reservationData()))
  private searchTimeslotParam$ = toObservable(this.searchTimeslotParam)
    .pipe(filter(search => search.every(s => s !== '')))

  truckTypeList = ['4 ล้อ', '6 ล้อ', '10 ล้อ']

  orderState = signal<TAppOrderState>({})
  poList = computed(() => Object.entries(this.orderState()).map(([orderNumb, box]) => ({ orderNumb, box })))
  compCode = computed(() => selectShortComp(this.reservationData()))
  totalBox = computed(() => this.orderList().reduce((acc, cur) => acc + cur.box, 0))
  compType = computed(() => this.comp().compType)

  private timeslot$ = this.searchTimeslotParam$
    .pipe(
      switchMap(p => this.searchTimeSlot(...p))
    )

  timeslot = toSignal(this.timeslot$, { initialValue: [] })

  activeSlot = computed(() => selectSlot(this.reservationData()))
  btnClass = (cur: string) => this.activeSlot().some(a => a === cur) ? 'btn btn-success' : 'btn btn-outline-secondary'
  disableTime = ({ isReserved, time }: TTimeSlot) => this.activeSlot().some(a => a === time) ? false : isReserved

  private modalService = inject(NgbModal)
  openModal = (ref: any) => this.modalService.open(ref)

  private ibobAdd = inject(IbobAddService)
  createReservation = this.ibobAdd.adminCreateReservation

  tooHigh = computed(() => this.totalBox() > this.maxBox() * this.activeSlot().length)
  tooLow = computed(() => this.totalBox() < this.minBox() * this.activeSlot().length)
  disable = computed(() => this.tooHigh() || this.tooLow())


  cloneActiveDoor = signal<TMaybe<TAppDoorProp>>(null)
  cloneActiveSlot = signal<TMaybe<string>>(null)
  cloneDate = signal(this.today)

  cloneParam = computed(() => {
    const door = this.cloneActiveDoor()
    const { year, month, day } = this.cloneDate()
    if (!door) return null
    return [door.doorId, `${year}-${month}-${day}`] satisfies [string, string]
  })

  private cloneParam$ = toObservable(this.cloneParam)
  private clonePossibleDoor$ = this.cloneParam$.pipe(
    filter(p => p !== null),
    switchMap(p => this.searchTimeSlot(...p)),
  )
  cloneTimeSlot = toSignal(this.clonePossibleDoor$, { initialValue: [] })

  cloneThaiDate = computed(() => {
    const { year, month, day } = this.cloneDate()
    return `${day}/${month}/${year}`
  })
  onDoorChange = (eve: TAppDoorProp | null) => {
    if (eve === null) return
    const clone = this.cloneActiveDoor()
    if (clone?.doorId === eve.doorId) return
    this.cloneActiveDoor.set(eve)
    if (this.activeDoor()?.doorId === eve.doorId) {
      this.cloneActiveSlot.set(this.activeSlot()[0])
      return
    }
    this.cloneActiveSlot.set(null)
  }
  onChangeDate = (date: NgbDate) => {
    this.cloneDate.set(date)
    this.cloneActiveSlot.set(null)
  }
  updateActiveSlot = (time: string) => this.cloneActiveSlot.set(time)
  private picker = viewChild<NgbDatepicker>("dp")
  openDateTimeModal = (ref: any) => {
    const date = this.selectDate()
    const activeDoor = this.activeDoor()
    this.cloneDate.set(date)
    this.cloneActiveDoor.set(activeDoor)
    this.cloneActiveSlot.set(this.activeSlot()[0])
    this.modalService.open(ref, { size: 'xl' })
    this.picker()?.focusDate(date)
  }
  closeDateTimeModal = () => {
    this.modalService.dismissAll()
    this.resetChangeDateForm()
  }
  private resetChangeDateForm = () => {
    this.cloneActiveDoor.set(null)
    this.cloneActiveSlot.set(null)
  }
  btnEditClass = (cur: string) => this.cloneActiveSlot() === cur ? 'btn btn-success' : 'btn btn-outline-secondary'

  changeReservationDate = () => {
    const cur = this.reservationData()
    if (!cur) return
    const id = cur.id
    const reservationDate = convertToIso(this.cloneDate())
    const reservationTime = `${this.cloneActiveSlot()}:00`
    const doorId = this.cloneActiveDoor()?.doorId
    this.changeReservationData(id, { reservationDate, reservationTime, doorId }).subscribe({
      next: (res) => {
        this.resetChangeDateForm()
        this.refetch()
        this.modalService.dismissAll()
      },
      error: (err) => {
        console.error(err)
        alert("err");
      }
    })
  }


  cloneDriver = signal<TMaybe<TDriverData>>(null)
  updateClone = <K extends keyof TDriverData>(field: K) =>
    (value: TDriverData[K]) =>
      this.cloneDriver.update(prev => prev ? ({ ...prev, [field]: value }) : prev)
  updateCloneName = this.updateClone("contactName")
  updateClonePhone = this.updateClone("phoneNumber")
  updateCloneTruckT = this.updateClone("truckType")
  updateClonePlate = this.updateClone("truckLicensePlate")
  updateNote = this.updateClone("note")
  onpenDriverModal = (ref: any) => {
    const driver = this.driverForm()
    this.cloneDriver.set(driver)
    this.modalService.open(ref)
  }
  closeDriverModal = () => {
    this.modalService.dismissAll()
    this.cloneDriver.set(null)
  }
  changeReservationDriver = () => {
    const cur = this.reservationData()
    if (!cur) return
    const id = cur.id
    const driverData = this.cloneDriver()
    if (driverData === null) return
    this.changeReservationData(id, driverData).subscribe({
      next: (res) => {
        this.refetch()
        this.modalService.dismissAll()
        this.cloneDriver.set(null)
      },
      error: (err) => {
        window.alert("มีข้อผิดพลาด")
        console.error(err)
      }
    })
  }

  cloneOrder = signal("")
  cloneBox = signal(0)
  private resetCloneOrder = () => {
    this.cloneOrder.set("")
    this.cloneBox.set(0)
  }
  openOrderModal = ({ orderNumb, box }: Pick<TAppOrder, "orderNumb" | "box">, ref: any) => {
    this.cloneOrder.set(orderNumb)
    this.cloneBox.set(box)
    this.modalService.open(ref)
  }
  closeOrderModal = () => {
    this.resetCloneOrder()
    this.modalService.dismissAll()
  }
  onDeleteOrder = (orderNumb: string) => {
    const data = this.reservationData()
    if (data === null) return
    const id = data.id
    this.ibobQuery.deleteReservationOrder(id, orderNumb).subscribe({
      next: () => {
        this.refetch()
        this.closeOrderModal()
      },
      error: (err) => {
        alert("มีข้อผิดพลาด")
        console.error(err)
      }
    })
  }

  changeReservationOrder = () => {
    const data = this.reservationData()
    if (data === null) return
    const id = data.id
    const orderNumb = this.cloneOrder()
    const box = this.cloneBox()
    this.ibobQuery.changeOrder(id, orderNumb, box).subscribe({
      next: () => {
        this.refetch()
        this.closeOrderModal()
      },
      error: (err) => {
        alert("มีข้อผิดพลาด")
        console.error(err)
      }
    })
  }
}
