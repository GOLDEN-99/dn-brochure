import { Component, inject } from '@angular/core';
import { CnRemarkService } from '../../../../service/cn/cn-remark/cn-remark.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cn-radio',
  imports: [FormsModule],
  templateUrl: './cn-radio.component.html',
  styleUrl: './cn-radio.component.scss'
})
export class CnRadioComponent {
  private remarkServ = inject(CnRemarkService)
  cnType = this.remarkServ.cnType
  setCnType = this.remarkServ.setCnType
}
