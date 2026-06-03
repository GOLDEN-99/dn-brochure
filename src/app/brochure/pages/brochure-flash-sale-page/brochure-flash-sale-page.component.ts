import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, retry, Subject, switchMap } from 'rxjs';
import { flashSaleParamsSchema, TFlashParams } from '../../utils/param-schema';
import { BrochureApiService } from '../../services/brochure-api.service';
import { TFlashSaleResponse } from '../../types/brochure.type';
import { TMaybe } from '../../../shared/types/index.type';
import { BrochureFlashSaleComponent } from "../../features/brochure-flash-sale/brochure-flash-sale.component";
import { ExportPdfService } from '../../../shared/services/export-pdf.service';
import { ToastService } from '../../../service/toast/toast.service';

@Component({
  selector: 'app-brochure-flash-sale-page',
  imports: [BrochureFlashSaleComponent],
  providers: [ExportPdfService],
  templateUrl: './brochure-flash-sale-page.component.html',
  styleUrl: './brochure-flash-sale-page.component.scss',
})
export class BrochureFlashSalePageComponent implements OnInit, OnDestroy {

  private readonly flashSaleClient = inject(BrochureApiService)
  private readonly exportService = inject(ExportPdfService)
  private readonly toastService = inject(ToastService)
  private readonly sub$ = new Subject<void>()
  private readonly route = inject(ActivatedRoute)
  private readonly result$ = this.route.params.pipe(
    map((params) => {
      const result = flashSaleParamsSchema.safeParse(params)
      if (!result.success) return null
      return result.data
    }),
    filter((data): data is TFlashParams => data !== null),
    switchMap((params) => this.flashSaleClient.getFlashSale(params)),
    retry(2),
  )

  result = signal<TMaybe<TFlashSaleResponse>>(null)

  loading = signal(true)

  ngOnInit(): void {
    this.result$.subscribe({
      next: (res) => {
        this.result.set(res)
      },
      complete: () => {
        this.loading.set(false)
      }
    })
  }

  ngOnDestroy(): void {
    this.sub$.next();
    this.sub$.complete();
  }

  onExport() {
    const b = document.querySelector('.flash-sale-bg.flash-sale-page.main-gap.static')
    if (!b) return
    this.loading.set(true)
    this.exportService
      .exportImg(b as HTMLElement, `${this.result()?.head.name ?? 'flash-sale'}.jpg`)
      .subscribe({
        next: () => {
          this.toastService.success("export สำเร็จ")
        },
        error: (_) => {
          this.toastService.danger("ไม่สามารถ export ได้")
        },
        complete: () => {
          this.loading.set(false)
        }
      })
  }

}

