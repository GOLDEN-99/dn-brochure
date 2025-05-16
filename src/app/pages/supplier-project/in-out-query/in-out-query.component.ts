import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-in-out-query',
  imports: [],
  templateUrl: './in-out-query.component.html',
  styleUrl: './in-out-query.component.scss'
})
export class InOutQueryComponent {
  isAdmin = signal(false)
}
