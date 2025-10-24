import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-discount-select',
  imports: [FormsModule],
  template: `<div class="app-form-select">
  <label for="event-select">กิจกรรม</label>
  <select
    name="event-select"
    id="event-select"
    [ngModel]="discountId()"
    (ngModelChange)="discountIdChange.emit($event)"
  >
    <option [ngValue]="0" disabled>กรุณาเลือก</option>
    @for (item of renderList(); track item.id) {
      <option [ngValue]="item.id" >{{item.discountName}}</option>
    }
  </select>
</div>`,
  styles: ''
})
export class DiscountSelectComponent {
  private billDiscount: TDiscTypeOpt[] = [
    { id: 1, discountName: "DC" },
    { id: 2, discountName: "Rebate" },
    { id: 3, discountName: "Incentive" },
    { id: 4, discountName: "Compensate" },
    { id: 5, discountName: "ส่วนลดเงินสด" },
  ]
  private goodDiscount: TDiscTypeOpt[] = [
    { id: 1, discountName: "DC" },
    { id: 2, discountName: "Rebate" },
    { id: 3, discountName: "Incentive" },
    { id: 4, discountName: "Compensate" },
    { id: 5, discountName: "Promotion" },
    { id: 6, discountName: "ค่าแรกเข้าสินค้า" },
    { id: 7, discountName: "อื่นๆ" }
  ]
  discountId = input(0)
  discountIdChange = output<number>()
  discountType = input.required<string>()
  renderList = computed(() => {
    switch (this.discountType()) {
      case "good": return this.goodDiscount
      case "bill": return this.billDiscount
      default: return []
    }
  })
}

type TDiscTypeOpt = { id: number, discountName: string }
