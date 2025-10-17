import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { combineLatest, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { IbobCompService } from '../../service/supplier/ibob-comp.service';

@Component({
  selector: 'app-supplier-layout',
  imports: [RouterOutlet],
  templateUrl: './supplier-layout.component.html',
  styleUrl: './supplier-layout.component.scss'
})
export class SupplierLayoutComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private compServ = inject(IbobCompService)
  private sub$ = new Subject<void>()
  ngOnInit(): void {
    this.route.pathFromRoot.map(snap => snap.url)[1]
      .pipe(
        map(arg => arg[1].path),
        tap(c => this.compServ.setCompType(c)),
        takeUntil(this.sub$)
      ).subscribe()
  }
  ngOnDestroy(): void {
    this.sub$.next()
    this.sub$.complete()
  }
}
