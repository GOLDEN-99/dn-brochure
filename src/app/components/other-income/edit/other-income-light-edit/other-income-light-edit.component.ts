import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-other-income-light-edit',
  imports: [],
  templateUrl: './other-income-light-edit.component.html',
  styleUrl: './other-income-light-edit.component.scss'
})
export class OtherIncomeLightEditComponent {
  eventDetail = input.required<TOiLEditProps>()

  openModal() { }
}

type TOiLEditProps = {
  totalBranch: number
  totalAmount: number
}
