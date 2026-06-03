import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../service/toast/toast.service';
import { VERSION_TOKEN } from '../../../shared/tokens/injection-token';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-brochure',
  imports: [FormsModule],
  templateUrl: './search-brochure.component.html',
  styles: ''
})
export class SearchBrochureComponent {
  readonly version = inject(VERSION_TOKEN)
  private readonly router = inject(Router)
  private readonly toastService = inject(ToastService)
  promotionType = signal<string>("")
  wholeCode = signal<string>("")

  disabled = computed(() => {
    return this.promotionType() === "" || this.wholeCode() === ""
  })

  async handleSubmit() {
    const wholeCode = this.wholeCode()
    const promoType = this.promotionType()
    try {
      await this.router.navigateByUrl(`/prochure/${wholeCode}/${promoType}`)
    } catch (err) {
      this.toastService.danger(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการค้นหาโบรชัว")
    }
  }

}
