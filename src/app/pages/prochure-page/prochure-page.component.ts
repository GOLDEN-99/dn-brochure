import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { ProchureComponent } from "../../components/prochure/prochure.component";
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TBorchureHead, TColor, TGroupItemList, TItem, TItemList, TMaybe, TSupplier } from '../../types';
import { exporter, transformItemList } from '../../lib';
import { map, tap } from 'rxjs';
import { ToastService } from '../../service/toast/toast.service';
import { PromotionPipe } from '../../pipe/promotion/promotion-pipe.pipe';
import { ProchureService } from '../../service/prochure/prochure.service';

@Component({
  selector: 'app-prochure-page',
  standalone: true,
  imports: [ProchureComponent, RouterLink, PromotionPipe],
  templateUrl: './prochure-page.component.html',
  styleUrl: './prochure-page.component.scss'
})
export class ProchurePageComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private brochureSerrv = inject(ProchureService)
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


