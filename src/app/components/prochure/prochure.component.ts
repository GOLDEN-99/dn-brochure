import { Component, computed, inject, input, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ProchureCardComponent } from "../prochure-card/prochure-card.component";
import { TCardProps, TColor, TGroupItemList, TItem, TSupplier, TWhole, TZone } from '../../types';
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

  itemList = input.required<TItem[]>()
  size = input.required<6 | 9>()
  wholeType = input.required<TWhole>()
  data = computed<TCardProps[]>(() => this.itemList().map((i) => ({ ...i, isFlag: false })))
  zone = input.required<TZone>()
  color = computed(() => zoneToColor(this.zone()))
  private today = signal<string>(new Date().toISOString())
  isStatic = input(false)
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
    const whole = this.wholeType()
    switch (whole) {
      case 'Normal': return `/image/${this.color()}/phar.png`
      case 'Dental': return `/image/${this.color()}/gen.png`
      case 'Clinic': return `/image/${this.color()}/dent.png`
    }
  })

  footerUrl = computed(() => {
    return `/image/${this.color()}/footer.png`
  })

  private formateDate(isodate: string) {
    const [year, month, date] = isodate.split('T')[0].split('-')
    return `${date}/${month}/${year}`
  }

}
