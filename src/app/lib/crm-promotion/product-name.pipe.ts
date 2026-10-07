import { Pipe, PipeTransform } from '@angular/core';
import { formatProductLabel } from './product-key';

interface IProduct {
  goodName: string
  sku: string
  unitDesc?: string | null
  barcode?: string | null
}

/** `(sku) name · unit` -- the unit is part of the product's identity now, so it is part of its name. */
@Pipe({
  name: 'productName',
})
export class ProductNamePipe implements PipeTransform {

  transform(product: IProduct): string {
    return formatProductLabel(product)
  }

}
