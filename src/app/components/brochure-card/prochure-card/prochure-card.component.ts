import { Component, computed, effect, input } from '@angular/core';
import { TColor, TCardProps, TPrice } from '../../../types';
import { environment } from '../../../../environments/environment';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-prochure-card',
  imports: [DecimalPipe],
  templateUrl: './prochure-card.component.html',
  styleUrl: './prochure-card.component.scss'
})
export class ProchureCardComponent {
  priceType = input.required<keyof TPrice>()
  color = input.required<TColor>()
  isStatic = input(false)
  nameStyle = computed(() => {
    const clr = this.color()
    const mode = this.isStatic()
    switch (clr) {
      case 'green': return mode ? 'card-green static-round-large static-p-large text-header' : "card-green res-round-large res-p-large text-header"
      case 'purple': return mode ? 'card-purple static-round-large static-p-large text-header' : "card-purple res-round-large res-p-large text-header"
    }
  })
  props = input.required<TCardProps>()
  imageUrl = computed(() => `${environment.imagePath}/${this.props().goodCode}.jpg`)
  displayPrice = computed(() => {
    const prop = this.props()
    const priceType = this.priceType()
    return prop.price[priceType]
  })
}
