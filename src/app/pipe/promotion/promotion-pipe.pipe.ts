import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'promotionPipe',
  standalone: true
})
export class PromotionPipe implements PipeTransform {

  transform(value: unknown): string {
    if (typeof value !== 'string') return ''
    switch (value) {
      case 'Hot': return 'โปรโมชั่น hotprice'
      case 'SP': return 'โปรโมชั่น special'
      case 'Monthly': return 'โปรโมชั่น รายเดือน'
      default: return ""
    }
  }

}
