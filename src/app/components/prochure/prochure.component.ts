import { Component, computed, inject, input, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ProchureCardComponent } from "../prochure-card/prochure-card.component";
import { TBorchureHead, TCardProps, TColor, TGroupItemList, TItem, TSupplier, TWhole, TZone } from '../../types';
import { ProchureService } from '../../service/prochure/prochure.service';
import { zoneToColor } from '../../lib';


@Component({
    selector: 'app-prochure',
    imports: [ProchureCardComponent],
    templateUrl: './prochure.component.html',
    styleUrl: './prochure.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ProchureComponent {
  //props
  itemList = input.required<TItem[]>()
  size = input.required<6 | 9>()
  head = input.required<TBorchureHead>()
  isStatic = input(false)

  //computed
  wholeType = computed<TWhole>(() => this.head().wholeType)
  data = computed<TCardProps[]>(() => this.itemList().map((i) => ({ ...i, isFlag: false })))
  zone = computed<TZone>(() => this.head().zone)
  color = computed(() => zoneToColor(this.zone()))
  date = computed(() => {
    const head = this.head()
    const toDate = head?.toDate
    const fromDate = head?.fromDate
    if (!fromDate || !toDate) {
      return this.getDefaultDate()
    }
    return `${this.formateDate(fromDate)} - ${this.formateDate(toDate)}`
  })
  template = computed(() => {
    const stat = this.isStatic()
    const len = this.size()
    if (!stat) {
      if (len === 6) {
        return 'content res-prochure-grid item-6'
      }
      return 'content res-prochure-grid item-9'
    }
    if (len === 6) {
      return 'content static item-6'
    }
    return 'content static item-9'
  })

  headerUrl = computed(() => {
    const { wholeType, promotionType, zone } = this.head()
    return `/image/${promotionType}/${zone}/${wholeType}.png`
  })

  footerUrl = computed(() => {
    const { zone } = this.head()
    return `/image/footer/${zone}.png`
  })

  private formateDate(isodate: string) {
    const [year, month, date] = isodate.split('T')[0].split('-').map(Number)
    return `${date} ${this.convertMonth(month)} ${this.convertYear(year)}`
  }

  private getDefaultDate() {
    const [year, month, _] = new Date().toISOString().split("T")[0].split("-").map(Number)
    const monthText = this.convertMonth(month)
    const be = this.convertYear(year)
    if (month === 2) {
      return this.isLeap(year) ? `1 ${monthText} ${be} - 29 ${monthText} ${be}` : `1 ${monthText} ${be} - 28 ${monthText} ${be}`
    }
    if ([4, 6, 9, 11].includes(month)) {
      return `1 ${monthText} ${be} - 30 ${monthText} ${be}`
    }
    return `1 ${monthText} ${be} - 31 ${monthText} ${be}`
  }

  private isLeap(year: number) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  private convertMonth(month: number) {
    switch (month) {
      case 1: return 'มกราคม'
      case 2: return 'กุมภาพันธ์'
      case 3: return 'มีนาคม'
      case 4: return 'เมษายน'
      case 5: return 'พฤษภาคม'
      case 6: return 'มิถุนายน'
      case 7: return 'กรกฏาคม'
      case 8: return 'สิงหาคม'
      case 9: return 'กันยายน'
      case 10: return 'ตุลาคม'
      case 11: return 'พฤศจิกายน'
      case 12: return 'ธันวาคม'
      default: throw new Error('วันที่ผิด')
    }
  }

  private convertYear(year: number) {
    return year + 543
  }

}
