import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-modal-layout',
  imports: [],
  templateUrl: './modal-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: ''
})
export class ModalLayoutComponent {
  crossClick = output<void>()
  title = input('modal title')
}
