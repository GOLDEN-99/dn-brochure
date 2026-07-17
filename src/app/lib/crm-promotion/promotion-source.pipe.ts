import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'promotionSource',
})
export class PromotionSourcePipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'HU':
        return 'Health Up';
      case 'SUPPLIER':
        return 'ซัพพลายเออร์';
      case 'BOTH':
        return 'ทั้ง Health Up และ ซัพพลายเออร์';
      default:
        return value;
    }
  }
}
