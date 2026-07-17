import { Component, computed, inject, signal } from '@angular/core';
import { FlashSaleService } from '../../../service/brochure/flash-sale/flash-sale.service';
import { FsBrochureComponent } from '../../../components/brochure-component/fs-brochure/fs-brochure.component';
import { ToastService } from '../../../service/toast/toast.service';
import { LoadingService } from '../../../service/loading/loading.service';

@Component({
  selector: 'app-flash-sale',
  imports: [FsBrochureComponent],
  templateUrl: './flash-sale.component.html',
  styleUrl: './flash-sale.component.scss'
})
export class FlashSaleComponent {

  private flashSaleServ = inject(FlashSaleService)

  private loadingServ = inject(LoadingService)

  // genRow = (len: number) => len === 3 ? 'flash-sale-row row-3' : 'flash-sale-row row-2'

  listItem = this.flashSaleServ.list

  head = this.flashSaleServ.head

  dayImg = computed(() => {
    const day = this.head()?.day
    if (!day) return 5
    return day < 10 ? day : 5
  })

  isStatic = signal<boolean>(true)

  mainClass = computed(() => this.isStatic() ? 'flash-sale-bg flash-sale-page main-gap main-pad static' : 'flash-sale-bg flash-sale-page container main-gap main-pad')

  headClass = computed(() => this.isStatic() ? 'head-space static' : 'head-space')

  plainTextClass = computed(() => this.isStatic() ? 'plain-day-text text-white static' : 'plain-day-text text-white')

  dayTextClass = computed(() => this.isStatic() ? 'day-text text-white static' : 'day-text text-white')

  fsLayoutClass = computed(() => this.isStatic() ? 'flash-sale-layout main-gap static' : 'flash-sale-layout main-gap')
  private toastService = inject(ToastService)

  async onExport() {
    const b = document.querySelector('.flash-sale-bg.flash-sale-page.main-gap.static')
    this.loadingServ.startLoad()
    try {

      if (!b) throw new Error('no target file')
      const { export2Img } = await import('../../../lib/brochure/pdf')
      await export2Img(b as HTMLElement, `${this.head()?.name}`)
      this.toastService.success("export สำเร็จ")

    } catch (err) {
      console.log(err)
      this.toastService.danger("ไม่สามารถ export ได้")

    } finally {
      this.loadingServ.endLoad()
    }
  }
}
