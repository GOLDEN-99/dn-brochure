import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-crm-home',
  imports: [],
  templateUrl: './crm-home.component.html',
  styleUrl: './crm-home.component.scss'
})
export class CrmHomeComponent {
  isOpen = signal(false)

  toggle() {
    this.isOpen.update(v => !v)
  }

  close() {
    this.isOpen.set(false)
  }
}
