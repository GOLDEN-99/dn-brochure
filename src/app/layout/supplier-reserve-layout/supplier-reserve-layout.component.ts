import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-supplier-reserve-layout',
  imports: [RouterOutlet],
  templateUrl: './supplier-reserve-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './supplier-reserve-layout.component.scss'
})
export class SupplierReserveLayoutComponent {

}
