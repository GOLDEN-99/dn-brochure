import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CnRemarkService } from '../../../../service/cn/cn-remark/cn-remark.service';

@Component({
  selector: 'app-result-select',
  imports: [FormsModule],
  templateUrl: './result-select.component.html',
  styleUrl: './result-select.component.scss'
})
export class ResultSelectComponent {
  private remarkServ = inject(CnRemarkService)
  remarkOption = this.remarkServ.remarkOpt
  setRemarkOpt = this.remarkServ.setRemarkOption
  resultOption = this.remarkServ.resultOptionList
  selectedResult = this.remarkServ.result
  compareResultFn = (opt1: any, opt2: any) => opt1 && opt2 ? opt1.id === opt2.id : opt1 === opt2;
}
