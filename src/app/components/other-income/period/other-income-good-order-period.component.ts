import { Component, inject, input, output, signal, viewChild } from '@angular/core';
import { OtherIncomeGoodOrderModalComponent } from "./other-income-good-order-modal/other-income-good-order-modal.component";
import { TOrderItemDto } from '../../../service/other-income/base-oi';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-other-income-good-order-period',
  imports: [OtherIncomeGoodOrderModalComponent, FormsModule, DecimalPipe],
  template: `    <div class="mb-3">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">เลขใบ PO</th>
              <th scope="col">รายได้บันทึก</th>
              <th scope="col">ใบแจ้งหนี้ซัพ</th>
              <th scope="col">ใบเสร็จรับเงิน</th>
              @if(canEdit()){
              <th scope="col">        
                  <button
                  class="btn btn-sm btn-primary me-1"
                  (click)="openPo()"
                  >
                  เพิ่ม po
                </button>
              </th>
            }
            </tr>
          </thead>
          <tbody>
            @for (order of orderList(); track order.id) {
            <tr>
              <td scope="row">{{ order.orderNumb }}</td>
              <td>{{ order.actualAmount | number : "1.2-2" }}</td>
              <td>{{ order.supInvNumb  }}</td>
              @if(canEdit()){
                <td colspan="2">{{ order.receNumb  }}</td>
              } @else{
                <td>{{ order.receNumb  }}</td>
              }
            </tr>
            }
          </tbody>
        </table>
      </div>
          
    <ng-template #poModal let-modal>
      <app-other-income-good-order-modal
        [periodAmount]="actualAmount()" 
        [compCode]="compCode()" 
        [compType]="compType()" 
        [periodId]="periodId()"
        (success)="onSuccess($event)" 
        (fail)="onFail($event)"
        (close)="modal.dismiss()"
      />
    </ng-template>`,
  styles: ``
})
export class OtherIncomeGoodOrderPeriodComponent {
  orderList = input.required<TOrderItemDto[]>()
  periodId = input.required<number>()
  actualAmount = input.required<number>()
  canEdit = input(false)
  success = output<string>()
  fail = output<string>()
  selectPeriodId = signal(0)
  compType = input.required<string | undefined>()
  compCode = input.required<string | undefined>()

  private modalServ = inject(NgbModal)

  private poModal = viewChild('poModal')

  openPo() {
    this.modalServ.open(this.poModal(), { size: 'xl' })
  }

  onSuccess(value: string) {
    this.modalServ.dismissAll()
    this.success.emit(value);
  }

  onFail(value: string) {
    this.modalServ.dismissAll()
    this.fail.emit(value);
  }
}
