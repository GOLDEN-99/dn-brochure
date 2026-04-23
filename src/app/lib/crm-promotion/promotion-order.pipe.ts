import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'promotionOrder',
})
export class PromotionOrderPipe implements PipeTransform {

  transform(value: string | number): string {
    switch (String(value)) {
      case '0': return 'ลำดับสุดท้าย'
      case '1': return 'ลำดับก่อนสุดท้าย'
      case '2': return 'ลำดับกลาง'
      case '3': return 'ลำดับแรก'
      default: return 'ลำดับไม่ถูกต้อง'
    }

  }

}
