import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'promotionType',
})
export class PromotionTypePipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'ITEM':
        return 'ลดรายสินค้า';
      case 'BILL':
        return 'ส่วนลดท้ายบิล';
      case 'BUNDLE':
        return 'ส่วนลดตามกลุ่มสินค้า';
      default:
        return value;
    }
  }

}
