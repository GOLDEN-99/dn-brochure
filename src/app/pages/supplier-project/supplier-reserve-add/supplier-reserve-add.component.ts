import { formatDate, registerLocaleData } from '@angular/common';
import { Component, computed, inject, Injectable, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbCalendarBuddhist, NgbDate, NgbDatepickerI18n, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import localeThai from '@angular/common/locales/th';
import { IBOBRESERVE_TOKEN } from '../../../service/ibob/ibobToken';
import { LoginService } from '../../../service/ibob/reserve/login.service';
import { TDate } from '../../../lib';


@Injectable()
export class NgbDatepickerI18nBuddhist extends NgbDatepickerI18n {
  private _locale = 'th';
  private _weekdaysShort: readonly string[];
  private _monthsShort: readonly string[];
  private _monthsFull: readonly string[];

  constructor() {
    super();

    registerLocaleData(localeThai);

    const weekdaysStartingOnSunday = [...Array(7).keys()].map((day) =>
      Intl.DateTimeFormat(this._locale, { weekday: 'narrow' }).format(new Date(Date.UTC(2021, 5, day - 1))),
    );
    this._weekdaysShort = weekdaysStartingOnSunday.map((day, index) => weekdaysStartingOnSunday[(index + 1) % 7]);

    this._monthsShort = [...Array(12).keys()].map((month) =>
      Intl.DateTimeFormat(this._locale, { month: 'short' }).format(new Date(2000, month)),
    );
    this._monthsFull = [...Array(12).keys()].map((month) =>
      Intl.DateTimeFormat(this._locale, { month: 'long' }).format(new Date(2000, month)),
    );
  }

  getMonthShortName(month: number): string {
    return this._monthsShort[month - 1] || '';
  }

  getMonthFullName(month: number): string {
    return this._monthsFull[month - 1] || '';
  }

  getWeekdayLabel(weekday: number) {
    return this._weekdaysShort[weekday - 1] || '';
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    return formatDate(jsDate, 'fullDate', this._locale);
  }

  // getYearNumerals(year: number): string {
  //   return String(year);
  // }
}


@Component({
  selector: 'app-supplier-reserve-add',
  imports: [FormsModule, NgbDatepickerModule],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarBuddhist },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nBuddhist },
    { provide: IBOBRESERVE_TOKEN, useExisting: LoginService }
  ],
  templateUrl: './supplier-reserve-add.component.html',
  styleUrl: './supplier-reserve-add.component.scss'
})
export class SupplierReserveAddComponent {
  end = input<string>()
  pageLabel = computed(() => {
    const path = this.end()
    switch (path) {
      case 'kk': return 'คลังกิ่งแก้ว'
      case 'bs': return 'คลังบุญทรัพย์ทวี'
      default: return 'ไม่พบคลัง'
    }
  })

  today = inject(NgbCalendar).getToday();
  activeDate = signal(this.today)

  option = signal([
    {
      id: '1',
      label: 'Express(Admin)',
      description: '',
      duration: 20
    },
    {
      id: '2',
      label: 'ประตู 1',
      description: '',
      duration: 30
    },
    {
      id: '3',
      label: 'ประตู 2',
      description: '',
      duration: 30
    },
    {
      id: '4',
      label: 'ประตู 3',
      description: '',
      duration: 30
    },
  ])

  timeSlot = ['08.30', '09.00', '09.30', '10.00', '10.30', '11.00', '11.30', '13.00']

  activeSlot = signal('08.30')

  private serv = inject(IBOBRESERVE_TOKEN)

  setActive = (cur: string) => this.activeSlot.set(cur)

  btnClass = (cur: string) => cur === this.activeSlot() ? 'btn btn-success' : 'btn btn-outline-secondary'

  btnSuffix = (cur: string) => cur + (cur === '11.00' ? ' (เต็ม)' : '')

  activeOption = signal('1')

  onChangeGate(gate: string) {
    this.activeOption.set(gate)
    this.serv.changeGate(gate)
  }

  onChangeDate(date: NgbDate) {
    this.activeDate.set(date)
    this.serv.changeDate(date)
  }

}
