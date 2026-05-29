import { Component } from '@angular/core';

@Component({
  selector: 'cn-complete',
  imports: [],
  templateUrl: './cn-complete.component.html',
  styleUrl: './cn-complete.component.scss',
})
export class CnCompleteComponent {
  // private readonly cnApi = inject(CnApiService)
  // head = this.cnApi.prependReq
  // query = this.cnApi.paramsSignal
  // cusStat = this.cnApi.cusStat
  // response = this.cnApi.wholeItemData
  // private readonly remarkServ = inject(CnRemarkService)
  // cnType = this.remarkServ.cnType
  // isShow = this.cnApi.showBank
  // motive = this.remarkServ.remarkOpt
  // prob = this.remarkServ.prob
  // showBankRef = [{ id: '0', stat: 'ไม่โอนคืน' }, { id: '1', stat: 'โอนคืน' }]
  // private readonly orderService = inject(CnOrderService)
  // showList = computed(() =>
  //   this.cnType() === 'whole'
  //     ? this.orderService.wholeBillItem()
  //     : this.orderService.selectedLotItem()
  // )
  // total = computed(() => {
  //   const cn = this.cnType()
  //   switch (cn) {
  //     case 'some': return this.orderService.selectedSubtotal()
  //     case 'whole': return this.orderService.wholeBillSubtotal()
  //     case null: return this.orderService.rawPrice()
  //   }
  // }
  // )
}
