import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navigate-btn',
  imports: [RouterLink],
  templateUrl: './navigate-btn.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './navigate-btn.component.scss'
})
export class NavigateBtnComponent {
  @Output() export = new EventEmitter<void>()

  hideBack = window.location.pathname.includes('marketing')

  handleClick() {
    this.export.emit()
  }
}
