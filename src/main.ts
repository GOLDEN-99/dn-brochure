/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch(async (err) => {
  if (err?.name === 'ChunkLoadError' || err?.message?.includes('Loading chunk')) {
    if (!sessionStorage.getItem('chunk_reload')) {
      // Don't reload if the server is down (503/5xx) — it won't help.
      const res = await fetch('/', { method: 'HEAD', cache: 'no-store' }).catch(() => null);
      if (res && res.status < 500) {
        sessionStorage.setItem('chunk_reload', '1');
        globalThis.location.reload();
        return;
      }
    }
  }
  console.error(err);
});
