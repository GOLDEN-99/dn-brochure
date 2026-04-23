import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'promotionThreshold',
})
export class PromotionThresholdPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case "BILLSUBTOTAL": return "ยอดขาย(บาท)"
      case "BILLCOUNT": return "จำนวนสินค้า(ชิ้น)"
      case "BUNDLECOUNT": return "จำนวน SET(ชุด)"
      default: return value
    }
  }

}
