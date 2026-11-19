import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { LoadingService } from '../../service/loading/loading.service';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  loadingServ = inject(LoadingService)
  loading = this.loadingServ.loading
}
