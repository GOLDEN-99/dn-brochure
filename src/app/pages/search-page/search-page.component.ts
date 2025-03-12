import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { debounceTime, filter, map, switchMap, tap } from 'rxjs';
import { ShopService } from '../../service/shop/shop.service';
import { TMaybe, TShopRecord } from '../../types';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent implements OnInit {
  private nnfb = inject(NonNullableFormBuilder)
  private shopService = inject(ShopService);
  searchForm = this.nnfb.group({
    shopCode: this.nnfb.control("", Validators.required)
  })
  private seachForm$ = this.searchForm.valueChanges.pipe(
    map(({ shopCode }) => shopCode?.trim()),
    filter(predicateEmpty),
    debounceTime(500),
    tap(() => this.startFetch())
  )
  loading = signal<boolean>(false)
  data = signal<TShopRecord[]>([])
  error = signal<TMaybe<string>>(null)

  ngOnInit(): void {
    this.seachForm$.pipe(
      switchMap((term) => this.shopService.search(term))
    ).subscribe(
      (shop) => { this.loading.update(() => false); this.data.update(() => shop); }
    )
  }

  private startFetch() {
    this.loading.update(() => true);
    this.error.update(() => null)
  }
}

const predicateEmpty = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false
  }
  return true
} 
