import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'promotionThreshold',
})
export class PromotionThresholdPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'BILLSUBTOTAL':
        return 'ยอดบิล(บาท)';
      case 'BILLCOUNT':
        return 'จำนวนสินค้าในบิล(ชิ้น)';
      case 'BUNDLECOUNT':
        return 'จำนวน SET(ชุด)';
      case 'COUNT':
        return 'จำนวนสินค้าในกลุ่ม(ชิ้น)';
      case 'SUBTOTAL':
        return 'ยอดสินค้าในกลุ่ม(บาท)';
      default:
        return value;
    }
  }
}
