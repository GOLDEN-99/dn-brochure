import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { SelectDoorOptionComponent } from "../../../components/inbound-outbound/select-door-option/select-door-option.component";
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../service/api/api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, concat, debounceTime, distinctUntilChanged, filter, forkJoin, map, single, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TExtendedComp } from '../../../service/supplier/supplier.token';
import { getOrElse } from '../../../lib/utli';
import { NgbCalendar, NgbDate, NgbDatepicker, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TActiveOrderV2, TAppDoor, TAppDoorProp, TAppOrder, TAppOrderState, TCreateReservationReq, TGetIbObRes, TLoginOrder, TTimeSlot } from '../../../types/ibob-supplier.type';
import { convertToIso } from '../../../lib';
import { IbobAddService } from '../../../service/ibob/ibob-add.service';
import { RouterLink } from '@angular/router';
import { TMaybe } from '../../../types';
import { IbobQueryReservationService } from '../../../service/ibob/ibob-query-reservation.service';
import { ToastService } from '../../../service/toast/toast.service';

@Component({
  selector: 'app-ibob-admin-add',
  imports: [SelectDoorOptionComponent, FormsModule, NgbDatepicker, RouterLink],
  templateUrl: './ibob-admin-add.component.html',
  styleUrl: './ibob-admin-add.component.scss'
})
export class IbobAdminAddComponent {
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
  orderState = signal<TAppOrderState>({})

  onAddOrder = ({ orderNumb }: TActiveOrderV2) => this.orderState.update(prev => ({ ...prev, [orderNumb]: (prev[orderNumb] ?? 0) + 1 }));

  poList = computed(() => Object.entries(this.orderState()).map(([orderNumb, box]) => ({ orderNumb, box })))
  checkPo = (orderNumb: string) => this.orderState.update(prev => ({ ...prev, [orderNumb]: (prev[orderNumb] ?? 0) + 1 }))
  changeBox = (orderNumb: string) => (box: number) => this.orderState.update(prev => ({ ...prev, [orderNumb]: box }))
  onDelete = (orderNumb: string) => this.orderState.update(({ [orderNumb]: _, ...res }) => ({ ...res }))
  totalBox = computed(() => this.poList().reduce((acc, cur) => acc + cur.box, 0))

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

  private queryOrder$ = this.compCode$.pipe(switchMap(c => this.ibobQueryService.searchOrder(c)))
  queryOrder = toSignal(this.queryOrder$, { initialValue: [] })
  resultComp$ = this.searchCompParam$.pipe(
    switchMap(search => this.searchComp(...search))
  )

  resultComp = toSignal(this.resultComp$, { initialValue: [] })

  private modalService = inject(NgbModal)
  openModal = (ref: any) => this.modalService.open(ref)

  onSelectComp({ compName, compEmail, compPhone, compCode, compType }: TExtendedComp) {
    this.comp.set({ compEmail, compName, compPhone, compCode, compType })
    this.orderState.set({})
    this.modalService.dismissAll()
  }

  private toast = inject(ToastService)

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
        this.toast.success(`เพิ่มการจองสำเร็จจำนวน ${res.length} slot`)
      },
      error: (err) => {
        this.toast.danger(`ไม่สามารถเพิ่มการจองได้ ${err}`)
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
    const order = this.poList()
    const note = this.note()
    return {
      doorId, reservationDate, companyName, contactName, phoneNumber, email, truckType, truckLicensePlate, note, compCode, order, shipto
    }
  }


  private ibobQueryService = inject(IbobQueryReservationService)
  private searchOrderModal = viewChild('searchOrderModal')
  orderNumb = signal('')
  displayOrder = computed(() => this.queryOrder().filter(({ orderNumb }) => {
    const po = this.orderNumb()
    if (po !== '') return orderNumb.includes(po)
    return true
  }));
  openSearchOrderModal = () => {
    this.modalService.open(this.searchOrderModal());
  }
  closeModal = () => {
    this.modalService.dismissAll();
    this.orderNumb.set('')
  }

}
