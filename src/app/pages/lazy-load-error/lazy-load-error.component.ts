import { Component, inject } from '@angular/core';
import { LazyLoadErrorService } from '../../service/lazy-load-error/lazy-load-error.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-lazy-load-error',
    imports: [DatePipe],
    templateUrl: './lazy-load-error.component.html',
    styleUrl: './lazy-load-error.component.scss'
})
export class LazyLoadErrorComponent {
    private readonly errorService = inject(LazyLoadErrorService);

    error = this.errorService.error;

    retry() {
        this.errorService.clearError();
        location.reload();
    }
}
