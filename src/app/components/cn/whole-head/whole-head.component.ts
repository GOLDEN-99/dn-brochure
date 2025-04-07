import { Component, computed, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CnApiService } from '../../../service/cn/cn-api/cn-api.service';
import { StatSelectComponent } from "../select/stat-select/stat-select.component";

@Component({
  selector: 'app-whole-head',
  imports: [FormsModule, StatSelectComponent],
  templateUrl: './whole-head.component.html',
  styleUrl: './whole-head.component.scss'
})
export class WholeHeadComponent {
  private cnApi = inject(CnApiService)
  params = this.cnApi.paramsSignal
  wholeRes = this.cnApi.wholeItemData
  isShow = this.cnApi.showBank
}
type TShowBank = 'ไม่โอนคืน' | 'โอนคืน'