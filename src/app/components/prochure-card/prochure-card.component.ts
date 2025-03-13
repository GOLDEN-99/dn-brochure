import { Component, computed, input } from '@angular/core';
import { TColor, TCardProps } from '../../types';

@Component({
  selector: 'app-prochure-card',
  standalone: true,
  imports: [],
  templateUrl: './prochure-card.component.html',
  styleUrl: './prochure-card.component.scss'
})
export class ProchureCardComponent {
  color = input<TColor>('purple')
  isStatic = input(false)
  nameStyle = computed(() => {
    const clr = this.color()
    const mode = this.isStatic()
    switch (clr) {
      case 'green': return mode ? 'card-green static-round-large static-p-large' : "card-green res-round-large res-p-large"
      case 'purple': return mode ? 'card-purple static-round-large static-p-large' : "card-purple res-round-large res-p-large"
    }
  })
  props = input.required<TCardProps>()
}
