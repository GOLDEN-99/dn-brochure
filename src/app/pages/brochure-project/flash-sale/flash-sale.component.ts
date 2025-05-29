import { Component, computed, inject, signal } from '@angular/core';
import { export2Img, exporter, transformItemList } from '../../../lib';
import { FlashSaleService } from '../../../service/brochure/flash-sale/flash-sale.service';
import { FsBrochureComponent } from '../../../components/brochure-component/fs-brochure/fs-brochure.component';
import { NavigateBtnComponent } from "../../../components/navigate-btn/navigate-btn.component";
import { ToastService } from '../../../service/toast/toast.service';

@Component({
  selector: 'app-flash-sale',
  imports: [FsBrochureComponent, NavigateBtnComponent],
  templateUrl: './flash-sale.component.html',
  styleUrl: './flash-sale.component.scss'
})
export class FlashSaleComponent {
  ref = [1, 2, 3, 4, 5]

  formattedRef = this.ref.reduce<number[][]>(transformItemList(3), [])

  private flashSaleServ = inject(FlashSaleService)

  genRow = (len: number) => len === 3 ? 'flash-sale-row row-3' : 'flash-sale-row row-2'

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

  inprogress = signal(false)
  private toastService = inject(ToastService)

  async onExport() {
    const b = document.querySelector('.flash-sale-bg.flash-sale-page.main-gap.main-pad.static')
    try {
      this.inprogress.update(() => true)
      if (!b) throw new Error('no target file')
      await export2Img(b as HTMLElement, `${this.head()?.name}`)
      this.toastService.success("export สำเร็จ")
      this.inprogress.update(() => false)
    } catch (err) {
      console.log(err)
      this.toastService.danger("ไม่สามารถ export ได้")
      this.inprogress.update(() => false)
    }
  }
}
