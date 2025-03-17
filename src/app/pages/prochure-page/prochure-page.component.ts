import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { ProchureComponent } from "../../components/prochure/prochure.component";
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TColor, TGroupItemList, TItem, TItemList, TMaybe, TSupplier } from '../../types';
import { exporter, transformItemList } from '../../lib';
import { map, tap } from 'rxjs';
import { ToastService } from '../../service/toast/toast.service';
import { PromotionPipe } from '../../pipe/promotion/promotion-pipe.pipe';

@Component({
  selector: 'app-prochure-page',
  standalone: true,
  imports: [ProchureComponent, RouterLink, PromotionPipe],
  templateUrl: './prochure-page.component.html',
  styleUrl: './prochure-page.component.scss'
})
export class ProchurePageComponent implements OnInit {
  private route = inject(ActivatedRoute)
  color = signal<TColor>("green")
  supplier = signal<TSupplier>("gen")
  brochure = viewChild<ProchureComponent>('brochure')
  isHeadReady = signal(false)
  head = signal<TMaybe<TBorchureHead>>(null)
  isContentReady = signal(false)
  content = signal<TGroupItemList>([])
  totalPage = computed(() => [...Array(this.content().length)].map((_, idx) => idx))
  maxItem = computed(() => this.head()?.promotionType === 'Hot' ? 6 : 9)
  currentPage = signal(0)
  currentGroup = computed<TItem[]>(() => {
    const currentContent = this.content()
    if (currentContent.length === 0) return []
    const page = this.currentPage()
    return currentContent[page]
  })
  private toastService = inject(ToastService)
  ngOnInit(): void {
    this.route.data.pipe(
      map(({ itemList }) => (itemList as TItemList)),
      tap(({ wholeName, wholeType, zone, promotionType }) => this.head.update(() => ({ wholeName, wholeType, zone, promotionType }))),
      map(({ promotion }) => promotion.reduce(transformItemList(this.maxItem()), []))
    ).subscribe((pro) => this.content.update(() => pro))
  }

  onClick(page: number) {
    this.currentPage.update(() => page)
  }

  async onExport() {
    const b = document.querySelector('.prochure.static') as HTMLElement | null
    if (b) {
      await exporter(b)
      this.toastService.success("export สำเร็จ")
      return
    }
    this.toastService.danger("ไม่สามารถ export ได้")
  }
}

type TBorchureHead = Omit<TItemList, 'promotion'>
