import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-other-income-light-edit',
  imports: [DecimalPipe],
  template: `
  <div class="mb-3">
  @let curEvent = eventDetail();
  <div class="row" style="justify-content: space-between">
    <h2 class="col-auto">รายละเอียด light box</h2>
    @if (canEdit()) {

    <div class="col-auto">
      <button class="btn btn-primary" (click)="openModal()">แก้ไข</button>
    </div>
    }
  </div>
  <div class="row">
    <div class="col">จำนวนสาขาทั้งหมด</div>
    <div class="col">
      {{ branchText() }}
    </div>
  </div>
  <div class="row">
    <div class="col">จำนวนเงินทั้งหมด</div>
    <div class="col">
      {{ curEvent.totalAmount | number : "1.2-2" }}
    </div>
    <!-- <div class="col">
      {{
        (totalIncome() | number : "1.2-2") +
          "/" +
          (curEvent.totalAmount | number : "1.2-2")
      }}
    </div> -->
  </div>
</div>
  `,
  styles: ''
})
export class OtherIncomeLightEditComponent {
  canEdit = input(false)
  eventDetail = input.required<TOiLEditProps>()
  totalIncome = input.required<number>()
  branchText = computed(() => { const { totalBranch, currentBranch } = this.eventDetail(); return `${currentBranch}/${totalBranch}` })
  openModal() { }
}

type TOiLEditProps = {
  totalBranch: number
  totalAmount: number
  currentBranch: number
}
