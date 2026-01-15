import { inject } from '@angular/core';
import { LazyLoadErrorService } from '../service/lazy-load-error/lazy-load-error.service';
import { LazyLoadErrorComponent } from '../pages/lazy-load-error/lazy-load-error.component';

export function handleLazyLoadError(path: string) {
    return (error: Error) => {
        const errorService = inject(LazyLoadErrorService);
        errorService.setError(error, path);
        console.error(`Failed to load component at path: ${path}`, error);
        return LazyLoadErrorComponent;
    };
}
