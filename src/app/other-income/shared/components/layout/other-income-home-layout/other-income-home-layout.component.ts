import { Component, DestroyRef, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, Subject } from 'rxjs';

@Component({
  selector: 'other-income-home-layout',
  imports: [RouterOutlet, RouterLinkActive, RouterLink],
  templateUrl: './other-income-home-layout.component.html',
  styleUrl: './other-income-home-layout.component.scss',
})
export class OtherIncomeHomeLayoutComponent implements OnInit {
  private readonly layoutMain = viewChild<ElementRef<HTMLElement>>('layoutMain')

  private readonly router = inject(Router)
  private readonly destroyRef = inject(DestroyRef)

  // readonly createObject = CREATE_ROUTE_PATH.map(({ path, name, icon }) => ({
  //   path: `/crm-promotion/${path}`,
  //   name,
  //   icon
  // }))


  sidebarOpen = signal(false)
  toggleSidebar = () => this.sidebarOpen.update(prev => !prev)
  closeSidebarOnMobile = () => {
    if (window.innerWidth < 1200) {
      this.sidebarOpen.set(false)
    }
  }

  private readonly sub$ = new Subject<void>()

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.layoutMain()?.nativeElement.scrollTo({ top: 0 })
    })
  }
}
