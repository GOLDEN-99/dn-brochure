import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';

import { OiNotLightDualService } from '../../../../service/other-income/oi-not-light-dual.service';
import { MonthlyService } from '../../../../service/other-income/monthly.service';
import { OiNotLightListService } from '../../../../service/other-income/oi-not-light-list.service';
import { ToastService } from '../../../../service/toast/toast.service';
import { OTHER_INCOME_PAGE_TOKEN } from '../../../../lib';
import { calculateWithFlatRate, calculateWithSemiStepRate, calculateWithStepRate } from '../../../../components/other-income/edit/other-income-monthly-edit/lib';
import { OtherIncomeHeadEditComponent } from '../../../../components/other-income/edit/other-income-head-edit/other-income-head-edit.component';
import { OtherIncomeNotLightEditComponent } from '../../../../components/other-income/edit/other-income-not-light-edit/other-income-not-light-edit.component';
import { OtherIncomeProductEditComponent } from '../../../../components/other-income/edit/other-income-product-edit/other-income-product-edit.component';
import { CreatePeriodComponent } from '../../../../components/other-income/create/create-period/create-period.component';
import { OtherIncomeDualMonthlyListComponent } from '../../../../components/other-income/template/other-income-dual-monthly-list.component';
import { MonthSelectComponent } from '../../../../components/date-input/month-select.component';
import { YearSelectComponent } from '../../../../components/date-input/year-select.component';
import { RouterLink } from "@angular/router";
import { OtherIncomePeriodDisplayComponent } from "../../../../components/other-income/period/other-income-period-display/other-income-period-display.component";

@Component({
  selector: 'app-not-light-dual-detail',
  imports: [
    FormsModule, DecimalPipe,
    OtherIncomeHeadEditComponent, OtherIncomeNotLightEditComponent,
    OtherIncomeProductEditComponent, CreatePeriodComponent,
    OtherIncomeDualMonthlyListComponent,
    MonthSelectComponent, YearSelectComponent,
    NgTemplateOutlet,
    RouterLink,
    OtherIncomePeriodDisplayComponent
  ],
  templateUrl: './not-light-dual-detail.component.html',
  styleUrl: './not-light-dual-detail.component.scss'
})
export class NotLightDualDetailComponent {

  private readonly dualServ = inject(OiNotLightDualService)
  private readonly monthServ = inject(MonthlyService)
  private readonly notLightList = inject(OiNotLightListService)
  private readonly toastService = inject(ToastService)
  private readonly modalService = inject(NgbModal)
  private readonly _pageToken = inject(OTHER_INCOME_PAGE_TOKEN)
  isPurchase = this._pageToken.isPurchase

  // ── data ─────────────────────────────────────────────────────────────────
  detail = this.dualServ.detail
  invalidValue = computed(() => {
    const d = this.detail()
    return !d || d.dn.length === 0 || d.hu.length === 0
  })
  dn = computed(() => this.detail()!.dn[0])
  hu = computed(() => this.detail()!.hu[0])
  mergedIncomeList = this.dualServ.mergeList
  // ── tabs ─────────────────────────────────────────────────────────────────
  activeTab = signal<'DN' | 'HU'>('DN')
  side = computed(() => this.activeTab() === 'DN' ? this.dn() : this.hu())

  // ── callbacks ─────────────────────────────────────────────────────────────
  onSuccess(msg: string) {
    this.toastService.success(msg)
    this.dualServ.refetch()
    this.notLightList.refetch()
  }
  onFail(msg: string) { this.toastService.danger(msg) }

  // ── shared date ────────────────────────────────────────────────────────
  private readonly today = inject(NgbCalendar).getToday()
  date = signal({ year: this.today.year, month: this.today.month, day: this.today.day })
  isoDate = computed(() => {
    const { year, month } = this.date()
    return `${year}-${String(month).padStart(2, '0')}-01`
  })
  onMonthChange = (v: number) => this.date.update(d => ({ ...d, month: v }))
  onYearChange = (v: number) => this.date.update(d => ({ ...d, year: v }))

  // ── calc modal ─────────────────────────────────────────────────────────
  summary = this.dualServ.summary
  dnSum = this.dualServ.dnSummary
  huSum = this.dualServ.huSummary
  dnRatio = computed(() => {
    const dn = this.dnSum()
    const hu = this.huSum()
    const total = dn.accCal + hu.accCal
    return total === 0 ? 0.5 : dn.accCal / total
  })

  //refactor start
  calculationTargetWithCap = computed(() => {
    const dn = this.dn()
    if (!dn) return 0
    const { notLight: { capAmount } } = dn
    const { accCal } = this.summary()
    if (capAmount === null) return accCal
    return Math.min(capAmount, accCal)
  })

  private readonly calculateFunction = computed(() => {
    const dn = this.dn()
    if (!dn) return (v: number) => v
    const { notLight, stepList } = dn
    switch (notLight.stepType) {
      case 1: return calculateWithFlatRate(stepList)
      case 2: return calculateWithSemiStepRate(stepList)
      default: return calculateWithStepRate(stepList)
    }
  })

  combineIncome = computed(() => this.calculateFunction()(this.calculationTargetWithCap()))


  dnIncome = computed(() => Math.round(this.combineIncome() * this.dnRatio()))
  huIncome = computed(() => this.combineIncome() - this.dnIncome())

  dnGainedIncome = computed(() => Math.max(0, this.dnIncome() - this.dnSum().accInc))
  huGainedIncome = computed(() => Math.max(0, this.huIncome() - this.huSum().accInc))
  // refator end

  disableCorrection = signal(false)

  onSubmitCorrection() {
    if (this.disableCorrection()) return
    const detail = this.detail()
    if (!detail) return
    const reason = `ปรับยอด ${detail.displayName}`
    const dn = detail.dn[0]
    const hu = detail.hu[0]
    const dnSum = this.dnSum()
    const huSum = this.huSum()
    this.disableCorrection.set(true)
    const startDate = this.isoDate()
    forkJoin([
      this.monthServ.insertNlMonth(dn.head.id, {
        eventType: dn.event.eventType,
        calAmount: huSum.accCal, // add hu cal to dn to gain total of dn +hu
        actualAmount: huSum.accAmount, // add hu actual to dn
        incomeAmount: this.dnGainedIncome(),
        cn: 0, receList: [], startDate, reason,
      }),
      this.monthServ.insertNlMonth(hu.head.id, {
        eventType: hu.event.eventType,
        calAmount: dnSum.accCal, // add dn cal amount for hu to gain total of dn + hu
        actualAmount: dnSum.accAmount, //add dn acc amount for hu
        incomeAmount: this.huGainedIncome(),
        cn: 0, receList: [], startDate, reason
      })
    ]).subscribe({
      next: () => {
        this.onSuccess('ปรับยอดสำเร็จ')
        this.modalService.dismissAll()
        this.disableCorrection.set(false)
      },
      error: (err) => { this.onFail(err.message); this.disableCorrection.set(false) }
    })
  }

  openCorrectionModal(content: any) {
    this.modalService.open(content).result.finally(() => {
      this.disableCorrection.set(false)
    })
  }
}
