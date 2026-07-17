import { Component, inject, InjectionToken } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-base-layout',
  imports: [RouterOutlet],
  template: `
    <section class="layout">
      <h1 class="mb-3 text-center">{{labelToken.label}}</h1>
      <router-outlet />
    </section>
    `,
  styles: `
    .layout {
      margin: auto;
      padding: 1rem 4rem; 
      width: 100%;
    }
`
})
export class BaseLayoutComponent {
  labelToken = inject(LABEL_TOKEN)
}

export interface ILable {
  label: string
}

export const LABEL_TOKEN = new InjectionToken<ILable>('PAGE_LABEL_TOKEN')
