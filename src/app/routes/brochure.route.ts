import { Route } from '@angular/router';
import { promotionResolver } from '../resolvers/promotion/promotion.resolver';
import { marketingResolver } from '../resolvers/marketing/marketing.resolver';
import { BROCHURE_PRICE_TYPE_TOKEN, BROCHURE_TOKEN } from '../lib';
import { BaseBrochureComponent } from '../pages/brochure-project/base-brochure/base-brochure.component';
import { ProchureService } from '../service/brochure/prochure/prochure.service';
import { MarketingService } from '../service/brochure/marketing/marketing.service';
import { FlashSaleComponent } from '../pages/brochure-project/flash-sale/flash-sale.component';
import { flashSaleResolver } from '../resolvers/flash-sale/flash-sale.resolver';

export const BROCHURE_ROUTES: Route[] = [
    {
        path: 'flash-sale/:zone/:idPromotion',
        component: FlashSaleComponent,
        resolve: { fs: flashSaleResolver }
    },
    {
        path: "prochure/:wholeCode/:promoType",
        component: BaseBrochureComponent,
        resolve: { itemList: promotionResolver },
        providers: [
            { provide: BROCHURE_TOKEN, useExisting: ProchureService },
            { provide: BROCHURE_PRICE_TYPE_TOKEN, useValue: { priceType: 'price' } }
        ]
    },
    {
        path: "marketing/:promoType/:isBkk/:isNew/:wholeType/:token/:idPromotion",
        component: BaseBrochureComponent,
        resolve: { itemList: marketingResolver },
        providers: [
            { provide: BROCHURE_TOKEN, useExisting: MarketingService },
            { provide: BROCHURE_PRICE_TYPE_TOKEN, useValue: { priceType: 'priceGold' } }
        ]
    },
];
