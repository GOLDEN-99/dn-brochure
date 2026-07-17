import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideSignalFormsConfig } from '@angular/forms/signals';

class CustomGlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.warn(error.message)
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    if (chunkFailedMessage.test(error.message)) {
      globalThis.window.location.reload();
    }
  }

}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: CustomGlobalErrorHandler },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes, withComponentInputBinding()),
    provideSignalFormsConfig({ classes: { 'is-invalid': (field) => field.state().invalid() && field.state().touched() } })
  ]
};
