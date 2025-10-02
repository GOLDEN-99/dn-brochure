import { Component, computed, inject, signal } from '@angular/core';
import { SelectDoorOptionComponent } from "../../../components/inbound-outbound/select-door-option/select-door-option.component";
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../service/api/api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, concat, debounceTime, distinctUntilChanged, filter, forkJoin, map, single, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TExtendedComp } from '../../../service/supplier/supplier.token';
import { getOrElse } from '../../../lib/utli';
import { NgbCalendar, NgbDate, NgbDatepicker, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TAppDoor, TAppDoorProp, TAppOrder, TCreateReservationReq, TGetIbObRes, TLoginOrder, TTimeSlot } from '../../../types/ibob-supplier.type';
import { convertToIso } from '../../../lib';
import { IbobAddService } from '../../../service/ibob/ibob-add.service';
import { RouterLink } from '@angular/router';
import { TMaybe } from '../../../types';

@Component({
  selector: 'app-ibob-admin-add',
  imports: [SelectDoorOptionComponent, FormsModule, NgbDatepicker, RouterLink],
  templateUrl: './ibob-admin-add.component.html',
  styleUrl: './ibob-admin-add.component.scss'
})
export class IbobAdminAddComponent {
  constructor() {
    this.queryOrder$.subscribe({
      next: (res) => this.orderList.set(res)
    })
  }
  comp = signal({
    compCode: "",
    compName: "",
    compEmail: "",
    compPhone: "",
    compType: ""
  })
  activeDoor = signal<TMaybe<TAppDoorProp>>(null)
  private minBox = computed(() => this.activeDoor()?.minBox ?? 0)
  private maxBox = computed(() => this.activeDoor()?.maxBox ?? 0)
  //private timeUse = computed(() => this.activeDoor()?.timeUse ?? 0)
  private isMultiple = computed(() => this.activeDoor()?.multiple === '1')
  onDoorChange = (eve: TAppDoorProp | null) => {
    this.activeDoor.update(prev => {
      if (eve === null) return prev
      if (prev?.doorId === eve.doorId) return prev
      this.activeSlot.set([])
      return eve
    })
  }

  private activeDoor$ = toObservable(this.activeDoor)
    .pipe(
      filter(d => d !== null),
      map(d => d.doorId),
      distinctUntilChanged()
    )
  private calService = inject(NgbCalendar)
  private today = this.calService.getToday()
  selectDate = signal(this.today)
  onChangeDate = (date: NgbDate) => {
    this.selectDate.set(date)
    this.activeSlot.set([])
  }
  private isoDate = computed(() => convertToIso(this.selectDate()))
  private date$ = toObservable(this.isoDate)
  private searchTimeslotParam$ = combineLatest([this.activeDoor$, this.date$])
  compCode = computed(() => {
    const { compCode, compType } = this.comp();
    return { compCode, compType }
  })
  private compCode$ = toObservable(this.compCode).pipe(filter(({ compCode, compType }) => compCode !== '' && compType !== ''))
  truckTypeList = ['4 ล้อ', '6 ล้อ', '10 ล้อ']

  contactName = signal("")
  phoneNumber = signal("")
  truckLicensePlate = signal("")
  truckType = signal("")
  note = signal("")
  orderList = signal<TAppOrder[]>([])
  private activeOrder = computed(() => this.orderList().flatMap(({ check, orderNumb, box }) => check ? [{ orderNumb, box }] : []))
  checkPo = (orderNumb: string) => this.orderList.update(prev => prev.map(p => p.orderNumb === orderNumb ? ({ ...p, check: !p.check }) : p))
  changeBox = (orderNumb: string) => (box: number) => this.orderList.update(prev => prev.map(p => p.orderNumb === orderNumb ? ({ ...p, box }) : p))
  totalBox = computed(() => this.orderList().reduce((acc, cur) => acc + cur.box, 0))

  private api = inject(ApiService)
  compType = signal("DN")
  private compType$ = toObservable(this.compType).pipe(filter(c => c !== ''))
  term = signal("")
  private term$ = toObservable(this.term).pipe(filter(t => t !== ''), distinctUntilChanged(), debounceTime(300))
  private searchCompParam$ = combineLatest([this.compType$, this.term$])
  private searchComp = (compType: string, term: string) =>
    this.api.get<TExtendedComp[]>(`${environment.oi}/comp/${compType}`, { params: { term } })
      .pipe(getOrElse<TExtendedComp[], TExtendedComp[]>([])
      )

  private searchOrder = ({ compType, compCode }: { compType: string, compCode: string }) =>
    this.api.get<TLoginOrder[]>(`${environment.oi}/ib-ob/active-order/${compType}/${compCode}`)
      .pipe(
        map<TLoginOrder[], TAppOrder[]>(orderList => orderList.map(order => ({ ...order, check: false, box: 0 })))
        , getOrElse<TAppOrder[], TAppOrder[]>([])
      )

  private searchTimeSlot = (doorId: string, date: string) =>
    this.api.get<TGetIbObRes>(`${environment.ibob}/GetInBound/${doorId}/${date}`)
      .pipe(
        map(({ slots }) => slots),
        getOrElse<TTimeSlot[], TTimeSlot[]>([])
      );
  private timeslot$ = this.searchTimeslotParam$
    .pipe(
      switchMap(p => this.searchTimeSlot(...p))
    )

  timeslot = toSignal(this.timeslot$, { initialValue: [] })
  updateActiveSlot = (time: string) => {
    const isMul = this.isMultiple()
    if (!isMul) {
      this.activeSlot.set([time])
      return
    }
    const current = this.activeSlot()
    const occurence = current.findIndex(cur => cur === time)
    if (occurence === -1) {
      this.activeSlot.update(prev => [...prev, time].sort())
    } else {
      if (occurence !== 0 && occurence !== current.length - 1) return
      this.activeSlot.update(prev => prev.filter(p => p !== time))
    }
  }
  activeSlot = signal<string[]>([])
  btnClass = (cur: string) => this.activeSlot().some(a => a === cur) ? 'btn btn-success' : 'btn btn-outline-secondary'

  private queryOrder$ = this.compCode$.pipe(switchMap(c => this.searchOrder(c)))
  resultComp$ = this.searchCompParam$.pipe(
    switchMap(search => this.searchComp(...search))
  )

  resultComp = toSignal(this.resultComp$, { initialValue: [] })

  private modalService = inject(NgbModal)
  openModal = (ref: any) => this.modalService.open(ref)

  onSelectComp({ compName, compEmail, compPhone, compCode, compType }: TExtendedComp) {
    this.comp.set({ compEmail, compName, compPhone, compCode, compType })
    this.modalService.dismissAll()
  }

  private ibobAdd = inject(IbobAddService)
  createReservation = this.ibobAdd.adminCreateReservation
  onSubmit() {
    const baseReq = this.getReservation
    const selectSlot = this.activeSlot()
    const mapReq = selectSlot.map(
      (reservationTime) =>
        this.createReservation({ ...baseReq, reservationTime })
          .pipe(tap(() => console.log(reservationTime)))
    )
    forkJoin(mapReq).subscribe({
      next: (res) => {
        console.table(res)
      },
      error: (err) => {
        console.error(err)
      }
    })
  }
  tooHigh = computed(() => this.totalBox() > this.maxBox() * this.activeSlot().length)
  tooLow = computed(() => this.totalBox() < this.minBox() * this.activeSlot().length)
  disable = computed(() => this.tooHigh() || this.tooLow())
  get getReservation(): Omit<TCreateReservationReq, 'reservationTime'> {
    const { compCode, compEmail: email, compName: companyName, compType: shipto } = this.comp()
    const phoneNumber = this.phoneNumber()
    const truckType = this.truckType()
    const truckLicensePlate = this.truckLicensePlate()
    const reservationDate = this.isoDate()
    const contactName = this.contactName()
    const doorId = this.activeDoor()?.doorId ?? "0"
    const order = this.activeOrder()
    const note = this.note()
    return {
      doorId, reservationDate, companyName, contactName, phoneNumber, email, truckType, truckLicensePlate, note, compCode, order, shipto
    }
  }
}
