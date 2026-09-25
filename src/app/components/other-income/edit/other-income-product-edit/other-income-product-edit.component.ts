import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-other-income-product-edit',
  imports: [],
  templateUrl: './other-income-product-edit.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './other-income-product-edit.component.scss'
})
export class OtherIncomeProductEditComponent {
  productList = input.required<TProductItem[]>()
  canEdit = input(false)
}

type TProductItem = {
  goodCode: string
  goodName: string
  barCode: string
  id: number
}