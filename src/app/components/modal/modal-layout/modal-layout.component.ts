import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-layout',
  imports: [],
  templateUrl: './modal-layout.component.html',
  styleUrl: './modal-layout.component.scss'
})
export class ModalLayoutComponent {
  crossClick = output<void>()
  title = input('modal title')
}
