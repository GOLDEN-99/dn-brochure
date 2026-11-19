import { Pipe, PipeTransform } from '@angular/core';
import { CHEAPEST_LABEL } from './benefit-hints';

@Pipe({
  name: 'promotionBenefitName',
})
export class PromotionBenefitNamePipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case "BATHDISC": return "ลดเป็นบาท"
      case "PERCENTDISC": return "ลดเป็นเปอร์เซ็นต์"
      case "PRICE": return "ปรับราคาเป็น"
      case "BILLBATHDISC": return "ลดทั้งบิลเป็นบาท"
      case "BILLPERCENTDISC": return "ลดทั้งบิลเป็นเปอร์เซ็นต์"
      case "PWP": return "สิทธิแลกซื้อ"
      case "GIFT": return "สินค้าแถม"
      case "BUNDLEPRICE": return "ปรับราคา SET"
      case "BUNDLEBATHDISC": return "ลดราคา SET เป็นบาท"
      case "BUNDLEPERCENTDISC": return "ลดราคา SET เป็นเปอร์เซ็นต์"
      case "ITEMBATHDISC": return "ลดสินค้าเป็นบาท"
      case "ITEMPERCENTDISC": return "ลดสินค้าเป็นเปอร์เซ็นต์"
      case "ITEMPRICE": return "ปรับราคาสินค้า"
      case "REGISTERFEE": return "ฟรีค่าสมัครสมาชิก"
      // Label only (z8qgvby6ht); the stored action stays CHEAPEST. The tier input on the
      // แถมในกลุ่ม page no longer borrows this -- it has a count label of its own.
      case "CHEAPEST": return CHEAPEST_LABEL
      default: return "สิทธิประโยชน์ไม่ถูกต้อง"
    }
  }

}
