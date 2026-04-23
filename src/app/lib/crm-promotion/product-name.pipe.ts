import { Pipe, PipeTransform } from '@angular/core';

interface IProduct {
  goodName: string
  sku: string
}

@Pipe({
  name: 'productName',
})
export class ProductNamePipe implements PipeTransform {

  transform({ sku, goodName }: IProduct): string {
    return `(${sku}) ${goodName}`
  }

}
