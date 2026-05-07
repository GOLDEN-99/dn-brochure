import { Component, computed, inject, input, signal, } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, EMPTY, filter, map, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductGroupConfigService } from '../../../../../service/crm-promotion/product-group-config.service';
import { ProductNamePipe } from '../../../../../lib/crm-promotion/product-name.pipe';
import { ProductConfigService } from '../../../../../service/crm-promotion/product-config.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-edit-product-config',
  imports: [RouterLink, ProductNamePipe],
  templateUrl: './edit-product-config.component.html',
  styles: ''
})
export class EditProductConfigComponent {
  private readonly groupConfig = inject(ProductGroupConfigService)
  private readonly productConfig = inject(ProductConfigService)
  productGroupId = input<number>()
  private readonly next$ = new BehaviorSubject(0)
  private readonly productGroupId$ = toObservable(this.productGroupId)
  private readonly currentProductInGroup$ = combineLatest({
    _: this.next$,
    id: this.productGroupId$
  })
    .pipe(
      map(({ id }) => Number(id)),
      filter(maybeNan => !Number.isNaN(maybeNan)),
      switchMap(id => this.productConfig.getAllProductGroup(id))
    )

  readonly currentProductInGroup = toSignal(this.currentProductInGroup$, { initialValue: [] })

  deletingId = signal<number | null>(null)
  deleteError = signal<string | null>(null)

  deleteProduct(listId: number) {
    this.deletingId.set(listId)
    this.deleteError.set(null)
    this.groupConfig.deleteProduct(listId).pipe(
      catchError((err: HttpErrorResponse) => {
        this.deleteError.set(err.error?.message ?? 'ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
        this.deletingId.set(null)
        return EMPTY
      })
    ).subscribe(() => {
      this.deletingId.set(null)
      this.next$.next(1)
    })
  }
}
