import { Component, computed, effect, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WholeHeadComponent } from "../../components/cn/whole-head/whole-head.component";
import { CnRemarkService } from '../../service/cn/cn-remark/cn-remark.service';
import { CnApiService } from '../../service/cn/cn-api/cn-api.service';
import { RemarkSelectComponent } from "../../components/cn/select/remark-select/remark-select.component";
import { ResultSelectComponent } from "../../components/cn/select/result-select/result-select.component";
import { CnRadioComponent } from "../../components/cn/radio/cn-radio/cn-radio.component";

@Component({
  selector: 'app-cn',
  imports: [FormsModule, WholeHeadComponent, RouterLink, RemarkSelectComponent, ResultSelectComponent, CnRadioComponent],
  templateUrl: './cn.component.html',
  styleUrl: './cn.component.scss'
})
export class CnComponent {
  router = inject(Router)

  onClick() {
    this.router.navigateByUrl(this.endPoint())
  }

  private remarkServ = inject(CnRemarkService)
  remarkList = this.remarkServ.withFallback
  private cnApi = inject(CnApiService)

  remarkOption = this.remarkServ.remarkOpt
  setRemarkOpt = this.remarkServ.setRemarkOption


  showResult = this.remarkServ.showResult

  selectedResult = model<string>("0")

  remark = this.cnApi.remark

  cnType = this.remarkServ.cnType

  endPoint = computed(() => this.cnType() ?? 'upload')
  btnClass = computed(() => this.remarkServ.invalidRemarkOpt() ? 'btn btn-primary w-100 disabled' : 'btn btn-primary w-100')

}
