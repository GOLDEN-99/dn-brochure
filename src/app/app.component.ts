import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationError } from '@angular/router';
import { ToastComponent } from "./components/toast/toast.component";
import { LoadingComponent } from "./components/loading/loading.component";
import { filter, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'dn-prochure';

  private readonly router = inject(Router);

  ngOnInit() {
    this.router.events.pipe(
      tap(console.log),
      filter((e): e is NavigationError => e instanceof NavigationError)
    ).subscribe(async (e) => {
      const isChunkError = e.error?.name === 'ChunkLoadError' || e.error?.message?.includes('Loading chunk');
      if (!isChunkError) return;

      if (!sessionStorage.getItem('chunk_reload')) {
        const res = await fetch('/', { method: 'HEAD', cache: 'no-store' }).catch(() => null);
        if (res && res.status < 500) {
          sessionStorage.setItem('chunk_reload', '1');
          globalThis.location.reload();
        }
      }
    });
  }
}
