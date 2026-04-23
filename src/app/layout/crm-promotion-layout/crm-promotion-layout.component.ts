import { Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CREATE_ROUTE_PATH, LIST_ROUTE_PATH } from '../../routes/crm-promotion.route';


@Component({
  selector: 'app-crm-promotion-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './crm-promotion-layout.component.html',
  styleUrl: './crm-promotion-layout.component.scss'
})
export class CrmPromotionLayoutComponent {
  private readonly layoutMain = viewChild<ElementRef<HTMLElement>>('layoutMain')

  private readonly router = inject(Router)
  private readonly destroyRef = inject(DestroyRef)

  readonly createObject = CREATE_ROUTE_PATH.map(({ path, name, icon }) => ({
    path: `/crm-promotion/${path}`,
    name,
    icon
  }))

  readonly listObject = LIST_ROUTE_PATH.map(({ path, name, icon }) => ({
    path: `/crm-promotion/${path}`,
    name,
    icon
  }))

  sidebarOpen = signal(false)
  toggleSidebar = () => this.sidebarOpen.update(prev => !prev)
  closeSidebarOnMobile = () => {
    if (window.innerWidth < 1200) {
      this.sidebarOpen.set(false)
    }
  }

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.layoutMain()?.nativeElement.scrollTo({ top: 0 })
    })
  }
}
