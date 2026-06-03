import { Component, computed, input } from '@angular/core';
import { TCardProps } from '../../types/brochure.type';
import { environment } from '../../../../environments/environment';
import { DecimalPipe } from '@angular/common';
import { TColor } from '../../utils/param-schema';

@Component({
  selector: 'brochure-special-card',
  imports: [DecimalPipe],
  templateUrl: './brochure-special-card.component.html',
  styleUrl: './brochure-special-card.component.scss',
})
export class BrochureSpecialCardComponent {
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
}
