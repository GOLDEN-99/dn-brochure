import { Injectable, signal } from '@angular/core';

export type TLazyLoadError = {
    message: string;
    stack?: string;
    path: string;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class LazyLoadErrorService {
    private _error = signal<TLazyLoadError | null>(null);

    readonly error = this._error.asReadonly();

    setError(error: Error, path: string) {
        this._error.set({
            message: error.message,
            stack: error.stack,
            path,
            timestamp: new Date()
        });
    }

    clearError() {
        this._error.set(null);
    }
}
