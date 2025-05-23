import { Component, computed, input } from '@angular/core';
import { TCardProps, TColor } from '../../types';
import { environment } from '../../../environments/environment';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-brochure-card-special',
  imports: [DecimalPipe],
  templateUrl: './brochure-card-special.component.html',
  styleUrl: './brochure-card-special.component.scss'
})
export class BrochureCardSpecialComponent {
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
