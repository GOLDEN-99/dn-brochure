import { of } from 'rxjs';

/**
 * ActivatedRoute stub for the supplier-project pages.
 *
 * BaseSupplierForm (src/app/lib/supplier/baseForm.ts) flattens every url segment along
 * pathFromRoot and then reads index 2 as the company type:
 *
 *   ['', 'supplier', ':compType', 'form', 'product']
 *                     ^ urlList()[2]
 *
 * and several pages additionally do `route.pathFromRoot.map(s => s.url)[1]` in ngOnInit and
 * read segment [1] of it. Both assume the page is mounted at that depth, so `provideRouter([])`
 * on its own is not enough -- it yields a single root route, and the components throw on
 * `undefined.pipe` / `undefined.toUpperCase`.
 *
 * This reproduces the real nesting so those derived signals resolve.
 */
export function supplierRouteMock(compType: 'DN' | 'HU' = 'DN', leaf = 'product') {
    return {
        pathFromRoot: [
            { url: of([{ path: '' }]) },
            { url: of([{ path: 'supplier' }, { path: compType }]) },
            { url: of([{ path: 'form' }, { path: leaf }]) },
        ],
        params: of({}),
        queryParams: of({}),
        data: of({}),
        snapshot: { params: {}, queryParams: {} },
    };
}
