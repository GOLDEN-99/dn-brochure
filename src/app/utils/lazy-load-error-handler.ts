import { inject } from '@angular/core';
import { LazyLoadErrorService } from '../service/lazy-load-error/lazy-load-error.service';
import { LazyLoadErrorComponent } from '../pages/lazy-load-error/lazy-load-error.component';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function lazyLoadWithRetry<T>(importFn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
    return importFn().catch(async (err) => {
        if (retries <= 0) throw err;
        await delay(delayMs);
        return lazyLoadWithRetry(importFn, retries - 1, delayMs * 2); // exponential backoff
    });
}

export function handleLazyLoadError(path: string) {
    return (error: Error) => {
        const errorService = inject(LazyLoadErrorService);
        errorService.setError(error, path);
        console.error(`Failed to load component at path: ${path}`, error);
        return LazyLoadErrorComponent;
    };
}
