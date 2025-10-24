import { computed, inject } from "@angular/core";
import { SupplierFromService } from "../../service/supplier/supplier-from.service";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, map, Subject, tap } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";

export class BaseSupplierForm {
    protected formService = inject(SupplierFromService)
    protected itemList = this.formService.item
    protected formState = this.formService.formState
    protected emplList = this.formService.emplList
    protected route = inject(ActivatedRoute)
    // ['', 'supplier', ':compType', 'form']
    // ['', 'supplier', ':compType', 'form', 'product', ]
    // ['', 'supplier', ':compType', 'form', 'condition', ]
    private url$ = combineLatest(this.route.pathFromRoot.map(snapshot => snapshot.url))
        .pipe(
            map(snap => snap.flatMap(s => s.map(a => a.path))),
            tap(console.log)
        )
    protected urlList = toSignal(this.url$, { initialValue: [] })
    protected compTypeSignal = computed(() => this.urlList()[2].toUpperCase())
    protected isDn = computed(() => this.compTypeSignal() === 'DN')
    protected isHu = computed(() => this.compTypeSignal() === 'HU')

    protected sub$ = new Subject<void>()
    protected unsub() {
        this.sub$.next()
        this.sub$.complete()
    }
}