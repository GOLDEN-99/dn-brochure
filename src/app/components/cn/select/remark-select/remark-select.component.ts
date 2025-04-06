import { Component, inject } from '@angular/core';
import { CnRemarkService } from '../../../../service/cn/cn-remark/cn-remark.service';
import { CnApiService } from '../../../../service/cn/cn-api/cn-api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-remark-select',
  imports: [FormsModule],
  templateUrl: './remark-select.component.html',
  styleUrl: './remark-select.component.scss'
})
export class RemarkSelectComponent {
  private remarkServ = inject(CnRemarkService)
  remarkList = this.remarkServ.withFallback

  remarkOption = this.remarkServ.remarkOpt
  setRemarkOpt = this.remarkServ.setRemarkOption

  compareRemarkFn(opt1: any, opt2: any): boolean {
    return opt1 && opt2 ? opt1.id === opt2.id : opt1 === opt2;
  }
}
