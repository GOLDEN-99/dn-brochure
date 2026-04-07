import { Component, inject } from '@angular/core';
import { CnRemarkService } from '../../../../service/cn/cn-remark/cn-remark.service';
import { FormsModule } from '@angular/forms';
import { CnApiService } from '../../../../service/cn/cn-api/cn-api.service';

@Component({
  selector: 'app-cn-radio',
  imports: [FormsModule],
  templateUrl: './cn-radio.component.html',
  styleUrl: './cn-radio.component.scss'
})
export class CnRadioComponent {
  private readonly remarkServ = inject(CnRemarkService)
  private readonly cnApi = inject(CnApiService)
  cannotCNWhole = this.cnApi.cannotCnWhole
  cnType = this.remarkServ.cnType
  setCnType = this.remarkServ.setCnType
}
