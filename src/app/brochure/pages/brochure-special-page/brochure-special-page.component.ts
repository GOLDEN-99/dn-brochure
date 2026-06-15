import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { BrochureApiService } from '../../services/brochure-api.service';
import { ExportPdfService } from '../../../shared/services/export-pdf.service';
import { ToastService } from '../../../service/toast/toast.service';
import { Subject, map, switchMap, retry, throwError, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { brochureZoneSchema, marketingParamsSchema } from '../../utils/param-schema';
import { TMaybe } from '../../../shared/types/index.type';
import { TBorchureHead, TItem } from '../../types/brochure.type';
import { BrochurePromotionPipe } from '../../pipe/brochure-promotion.pipe';
import { BrochurePageComponent } from "../../features/brochure-page/brochure-page.component";
import { BROCHURE_PAGE_TOKEN } from '../../token/brochure-token';
import { transformItemList } from '../../libs/libs';

@Component({
  selector: 'app-brochure-special-page',
  imports: [BrochurePromotionPipe, BrochurePageComponent],
  providers: [ExportPdfService],
  templateUrl: './brochure-special-page.component.html',
  styleUrl: '../base-brochure.scss',
})
export class BrochureSpecialPageComponent implements OnInit, OnDestroy {
  private readonly context = inject(BROCHURE_PAGE_TOKEN)
  priceType = this.context.priceType
  pageSize = this.context.pageSize
  private readonly flashSaleClient = inject(BrochureApiService)
  private readonly exportService = inject(ExportPdfService)
  private readonly toastService = inject(ToastService)
  private readonly sub$ = new Subject<void>()
  private readonly route = inject(ActivatedRoute)
  private readonly result$ = this.route.params.pipe(
    map((params) => marketingParamsSchema.parse(params)),
    switchMap((params) => this.flashSaleClient.getSpecialBrochureList(params)),
    map(({ wholeName, wholeType, zone, isNewCustomer, promotionType, fromDate, toDate, promotion }) => {
      const list = promotion.reduce<TItem[][]>(transformItemList(this.pageSize), [[]])
      return {
        head: {
          wholeName,
          wholeType,
          zone,
          isNewCustomer, promotionType,
          fromDate, toDate
        } satisfies TBorchureHead,
        list,
        maxPage: list.length,
        pageSize: this.pageSize
      }
    }),
  )

  result = signal<TMaybe<TBrochureSpecialState>>(null)

  loading = signal(true)
  exporting = signal(false)

  color = computed(() => {
    const zone = this.result()?.head.zone
    if (zone === "BKK") return "purple"
    return "green"
  })

  onSetPage(page: number) {
    this.currentPage.update(() => page)
  }

  currentPage = signal(0)
  currentGroup = computed<TItem[]>(() => {
    const result = this.result()
    if (!result) return []
    const currentContent = result.list
    if (currentContent.length === 0) return []
    const page = this.currentPage()
    return currentContent[page]
  })
  totalPage = computed(() =>
    Array.from({ length: this.result()?.maxPage ?? 0 }).map((_, i) => i)
  )

  ngOnInit(): void {
    this.result$.subscribe({
      next: (res) => {
        this.result.set(res)
        this.loading.set(false)
      },
      error: (err) => {
        console.error(err)
        this.toastService.danger("ไม่สามารถโหลดข้อมูลได้")
        this.loading.set(false)
      }
    })
  }

  ngOnDestroy(): void {
    this.sub$.next();
    this.sub$.complete();
  }

  onExport() {
    const b = document.querySelectorAll('.static.prochure')
    if (!b.length) return
    this.exporting.set(true)
    this.exportService.exportPdf(Array.from(b) as HTMLElement[],
      `${this.result()?.head.wholeName}-${this.result()?.head.promotionType}`).subscribe({
        next: () => {
          this.exporting.set(false)
        },
        error: (e) => {
          console.log(e)
          this.toastService.danger("ไม่สามารถ export ได้")
          this.exporting.set(false)
        }
      })
  }
}


type TBrochureSpecialState = {
  head: TBorchureHead
  list: TItem[][]
  maxPage: number
  pageSize: number
}