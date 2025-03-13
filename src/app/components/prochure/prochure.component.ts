import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ProchureCardComponent } from "../prochure-card/prochure-card.component";
import { TCardProps, TColor, TSupplier } from '../../types';
import { ProchureService } from '../../service/prochure/prochure.service';


@Component({
  selector: 'app-prochure',
  standalone: true,
  imports: [ProchureCardComponent],
  templateUrl: './prochure.component.html',
  styleUrl: './prochure.component.scss'
})
export class ProchureComponent implements OnInit {

  supplier = input.required<TSupplier>()
  color = input.required<TColor>()
  private prochureServcie = inject(ProchureService)
  private prochure$ = this.prochureServcie.getProchureList('test parasm')
  private today = signal<string>(new Date().toISOString())
  formattedDate = computed(() => this.formateDate(this.today()))
  data = signal<TCardProps[]>([])
  ngOnInit(): void {
    this.prochure$.subscribe((d) => {
      this.data.update(() => d)
    })
  }

  headerUrl = computed(() => {
    return `/image/${this.color()}/${this.supplier()}.png`
  })

  footerUrl = computed(() => {
    return `/image/${this.color()}/footer.png`
  })

  private formateDate(isodate: string) {
    const [year, month, date] = isodate.split('T')[0].split('-')
    return `${date}/${month}/${year}`
  }

  items = [...Array(6)].map((_, i) => i)

  onExport() {

  }
}
