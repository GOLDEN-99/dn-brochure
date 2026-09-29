import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-config-layout',
  imports: [RouterOutlet],
  templateUrl: './config-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './config-layout.component.scss'
})
export class ConfigLayoutComponent {

}
