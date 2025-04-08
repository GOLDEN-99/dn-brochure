import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CnApiService } from '../../../../service/cn/cn-api/cn-api.service';

@Component({
  selector: 'app-stat-select',
  imports: [FormsModule],
  templateUrl: './stat-select.component.html',
  styleUrl: './stat-select.component.scss'
})
export class StatSelectComponent {

  private cnApi = inject(CnApiService)
  custStat = this.cnApi.cusStat

  showBankRef = [{ id: '0', stat: 'ไม่โอนคืน' }, { id: '1', stat: 'โอนคืน' }]

  compareStatFn = (opt1: any, opt2: any) => opt1 && opt2 ? opt1.id === opt2.id : opt1 === opt2;
}
