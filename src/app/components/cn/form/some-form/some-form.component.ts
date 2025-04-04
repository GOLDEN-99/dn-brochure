import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-some-form',
  imports: [DecimalPipe],
  templateUrl: './some-form.component.html',
  styleUrl: './some-form.component.scss'
})
export class SomeFormComponent {
  productItemList = [{ productName: "p1", price: 17.2 }, { productName: "p2", price: 13 }, { productName: "p3", price: 10.257 }]
}
