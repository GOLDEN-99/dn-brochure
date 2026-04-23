import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'promotionPriority',
})
export class PromotionPriorityPipe implements PipeTransform {

  transform(value: string | number): string {
    const prased = String(value)
    if (prased === '0') return 'ใช้ร่วมกันได้'
    return `priority ${prased}`;
  }

}
