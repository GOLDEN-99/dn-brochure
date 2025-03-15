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
  wholeType = input.required<TWhole>()
  data = computed<TCardProps[]>(() => this.itemList().map((i) => ({ ...i, isFlag: false })))
  zone = input.required<TZone>()
  color = computed(() => zoneToColor(this.zone()))
  private today = signal<string>(new Date().toISOString())
  isStatic = input(false)
  formattedDate = computed(() => this.formateDate(this.today()))

  headerUrl = computed(() => {
    const whole = this.wholeType()
    if (whole === 'Normal') {
      return `/image/${this.color()}/phar.png`
    }
    throw Error('unhandle wholetype')
  })

  footerUrl = computed(() => {
    return `/image/${this.color()}/footer.png`
  })

  private formateDate(isodate: string) {
    const [year, month, date] = isodate.split('T')[0].split('-')
    return `${date}/${month}/${year}`
  }

}
