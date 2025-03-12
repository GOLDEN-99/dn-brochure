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
  nameStyle = computed(() => {
    const clr = this.color()
    switch (clr) {
      case 'green': return "label card-green"
      case 'purple': return "label card-purple"
    }
  })
  props = input<TCardProps>(
    {
      name: "product name",
      code: "product code",
      image: "https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U",
      priceTier: {
        standard: 1200,
        silver: 1100,
        gold: 999,
      },
      displayPrice: 999,
      isFlag: false
    }
  )
}
