import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ToastService } from '../../service/toast/toast.service';
import { exporter } from '../../lib';
import { MarketingService } from '../../service/marketing/marketing.service';
import { PromotionPipe } from '../../pipe/promotion/promotion-pipe.pipe';
import { ProchureComponent } from "../../components/prochure/prochure.component";
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-external-brochure',
    imports: [PromotionPipe, ProchureComponent],
    templateUrl: './external-brochure.component.html',
    styleUrl: './external-brochure.component.scss'
})
export class ExternalBrochureComponent implements OnInit {
  private route = inject(ActivatedRoute)
  ngOnInit(): void {
    this.route.data.subscribe()
  }

  private brochureServ = inject(MarketingService)
  head = this.brochureServ.head
  color = this.brochureServ.color
  content = this.brochureServ.content
  currentPage = signal(0)
  maxItem = this.brochureServ.maxItem
  totalPage = this.brochureServ.totalPage


  currentGroup = computed(() => {
    const curContent = this.content()
    if (curContent.length === 0) return []
    const page = this.currentPage()
    return curContent[page]
  })
  onClick(page: number) {
    this.currentPage.update(() => page)
  }


  inprogress = signal(false)
  private toastService = inject(ToastService)
  async onExport() {
    const b = document.querySelectorAll('.static.prochure')
    try {
      this.inprogress.update(() => true)
      await exporter(Array.from(b) as HTMLElement[], `${this.head()?.wholeName}-${this.head()?.promotionType}`)
      this.toastService.success("export สำเร็จ")
      this.inprogress.update(() => false)
    } catch (err) {
      console.log(err)
      this.toastService.danger("ไม่สามารถ export ได้")
      this.inprogress.update(() => false)
    }
  }
}
