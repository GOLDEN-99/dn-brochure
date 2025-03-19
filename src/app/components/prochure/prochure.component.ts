import { Component, computed, inject, input, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ProchureCardComponent } from "../prochure-card/prochure-card.component";
import { TBorchureHead, TCardProps, TColor, TGroupItemList, TItem, TSupplier, TWhole, TZone } from '../../types';
import { ProchureService } from '../../service/prochure/prochure.service';
import { zoneToColor } from '../../lib';


@Component({
  selector: 'app-prochure',
  standalone: true,
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
  private today = signal<string>(new Date().toISOString())
  formattedDate = computed(() => this.formateDate(this.today()))
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
    const [year, month, date] = isodate.split('T')[0].split('-')
    return `${date}/${month}/${year}`
  }

}
