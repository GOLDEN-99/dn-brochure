import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'promotionSource',
})
export class PromotionSourcePipe implements PipeTransform {

  // The API returns a null source for anything created since 2026-05-13 (it never
  // persists the field). Callers should resolve it first, but never render a blank
  // cell if one slips through.
  transform(value: string | null | undefined): string {
    if (!value) return 'ไม่ระบุ';
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
