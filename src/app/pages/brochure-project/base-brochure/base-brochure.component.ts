import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProchureComponent } from '../../../components/brochure-component/prochure/prochure.component';
import { PromotionPipe } from '../../../pipe/promotion/promotion-pipe.pipe';
import { NavigateBtnComponent } from '../../../components/navigate-btn/navigate-btn.component';
import { BROCHURE_TOKEN, exporter } from '../../../lib';
import { TItem } from '../../../types';
import { ToastService } from '../../../service/toast/toast.service';


@Component({
  selector: 'app-base-brochure',
  imports: [ProchureComponent, PromotionPipe, NavigateBtnComponent],
  templateUrl: './base-brochure.component.html',
  styleUrl: './base-brochure.component.scss',
})
export class BaseBrochureComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private brochureSerrv = inject(BROCHURE_TOKEN)
  color = this.brochureSerrv.color
  head = this.brochureSerrv.head
  content = this.brochureSerrv.content
  totalPage = this.brochureSerrv.totalPage
  maxItem = this.brochureSerrv.maxItem
  currentPage = signal(0)
  currentGroup = computed<TItem[]>(() => {
    const currentContent = this.content()
    if (currentContent.length === 0) return []
    const page = this.currentPage()
    return currentContent[page]
  })
  inprogress = signal(false)
  private toastService = inject(ToastService)
  ngOnInit(): void {
    this.route.data.subscribe()
  }

  onClick(page: number) {
    this.currentPage.update(() => page)
  }

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
