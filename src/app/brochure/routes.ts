import { Route } from "@angular/router";
import { VERSION_TOKEN } from "../shared/tokens/injection-token";
import { SearchBrochureComponent } from "./pages/search-brochure/search-brochure.component";
import { handleLazyLoadError } from "../utils/lazy-load-error-handler";
import { BROCHURE_PAGE_TOKEN } from "./token/brochure-token";

export const BROCHURE_ROUTES: Route[] = [
    {
        path: '',
        providers: [
            { provide: VERSION_TOKEN, useValue: { version: '2026-06-03' } }
        ],
        component: SearchBrochureComponent,

    },
    {
        path: 'flash-sale/:zone/:idPromotion',
        loadComponent: () => import('./pages/brochure-flash-sale-page/brochure-flash-sale-page.component')
            .then(m => m.BrochureFlashSalePageComponent)
            .catch(handleLazyLoadError('Flash Sale Page'))
    },
    {
        path: "prochure/:wholeCode/:promoType",
        providers: [
            {
                provide: BROCHURE_PAGE_TOKEN,
                useValue: { priceType: 'price', pageSize: 12 }
            },
        ],
        loadComponent: () => import('./pages/brochure-normal-page/brochure-normal-page.component')
            .then(p => p.BrochureNormalPageComponent)
            .catch(handleLazyLoadError('Normal Brochure Page'))
    },
    {
        path: "marketing/:promoType/:isBkk/:isNew/:wholeType/:token/:idPromotion",
        providers: [
            {
                provide: BROCHURE_PAGE_TOKEN,
                useValue: { priceType: 'priceGold', pageSize: 12 }
            },
        ],
        loadComponent: () => import('./pages/brochure-special-page/brochure-special-page.component')
            .then(m => m.BrochureSpecialPageComponent)
            .catch(handleLazyLoadError('Marketing Brochure Page'))
    },


];