import { Component, computed, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CnApiService } from '../../../service/cn/cn-api/cn-api.service';

@Component({
  selector: 'app-whole-head',
  imports: [FormsModule],
  templateUrl: './whole-head.component.html',
  styleUrl: './whole-head.component.scss'
})
export class WholeHeadComponent {
  private cnApi = inject(CnApiService)
  params = this.cnApi.paramsSignal
  wholeRes = this.cnApi.wholeItemData
  showBankRef: TShowBank[] = ['ไม่โอนคืน', 'โอนคืน']
  showBank = model<TShowBank>('ไม่โอนคืน')
  isShow = computed(() => this.showBank() === 'โอนคืน')
}
type TShowBank = 'ไม่โอนคืน' | 'โอนคืน'