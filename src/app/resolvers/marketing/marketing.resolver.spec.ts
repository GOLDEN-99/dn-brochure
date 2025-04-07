import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RedirectCommand, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { marketingResolver } from './marketing.resolver';
import { TItem, TItemList, TMarketingParams, TPrice, TPromotionType, TWhole } from '../../types';
import { ToastService } from '../../service/toast/toast.service';
import { Observable, of, throwError } from 'rxjs';
import { MarketingService } from '../../service/brochure/marketing/marketing.service';

describe('marketingResolver', () => {
  const executeResolver: ResolveFn<TItemList> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => marketingResolver(...resolverParameters));

  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockProchureService: jasmine.SpyObj<MarketingService>;
  let mockActivatedRouteSnapshot: jasmine.SpyObj<ActivatedRouteSnapshot>;
  let mockParamMap: Map<string, string | number | boolean>;


  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['parseUrl']);
    mockToastService = jasmine.createSpyObj('ToastService', ['danger']);
    mockProchureService = jasmine.createSpyObj('ProchureService', ['getProchureList']);
    mockParamMap = new Map();

    mockActivatedRouteSnapshot = jasmine.createSpyObj('ActivatedRouteSnapshot', [], {
      paramMap: {
        get: (key: string) => mockParamMap.get(key)
      }
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToastService },
        { provide: MarketingService, useValue: mockProchureService }
      ]
    });


  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });

  it('should return prochure list when valid parameters are provided', async () => {
    // Arrange
    const promoType: TPromotionType = 'SP';
    const isBkk = true
    const isNew = true
    const wholeType: TWhole = 'Normal'
    const token = "token"
    const idPromotion = '1'

    mockParamMap.set('promoType', promoType);
    mockParamMap.set('isBkk', isBkk)
    mockParamMap.set('isNew', isNew)
    mockParamMap.set('wholeType', wholeType)
    mockParamMap.set('token', token)
    mockParamMap.set('idPromotion', idPromotion)

    const mockPrice: TPrice = {
      price: 100,
      priceGold: 80,
      priceSilver: 90,
      priceStandard: 100
    };

    const mockItem: TItem = {
      goodCode: 'G001',
      goodName: 'Test Item',
      barCode: 'B001',
      price: mockPrice
    };

    const mockItemList: TItemList = {
      fromDate: '2025-01-01',
      toDate: '2025-12-31',
      wholeName: 'Test Whole',
      wholeType: 'Normal',
      zone: 'BKK',
      promotionType: promoType,
      isNewCustomer: 'NC',
      promotion: [mockItem]
    };

    mockProchureService.getBrochureList.and.returnValue(of(mockItemList));
    mockRouter.parseUrl.and.returnValue({ commands: [] } as any);

    // Act
    const result = await executeResolver(mockActivatedRouteSnapshot, {} as RouterStateSnapshot);

    // Assert
    expect(mockProchureService.getBrochureList).toHaveBeenCalledWith({ isBkk, wholeType, token, idPromotion, isNewCustomer: isNew, promoType } satisfies TMarketingParams)
    if (result instanceof Observable) {
      result.subscribe(data => expect(data).toEqual(mockItemList))
    }

  });

  it('should handle errors from ProchureService', async () => {
    // Arrange
    const promoType: TPromotionType = 'Hot';
    const isBkk = true
    const isNew = true
    const wholeType: TWhole = 'Normal'
    const token = "token"
    const idPromotion = '1'

    mockParamMap.set('promoType', promoType);
    mockParamMap.set('isBkk', isBkk)
    mockParamMap.set('isNew', isNew)
    mockParamMap.set('wholeType', wholeType)
    mockParamMap.set('token', token)
    mockParamMap.set('idPromotion', idPromotion)

    mockProchureService.getBrochureList.and.returnValue(throwError(() => new Error('Service error')));

    // Act
    const result = await executeResolver(mockActivatedRouteSnapshot, {} as RouterStateSnapshot);
    // Assert
    expect(mockProchureService.getBrochureList).toHaveBeenCalledWith({ isBkk, wholeType, token, idPromotion, isNewCustomer: isNew, promoType } satisfies TMarketingParams);
    if (result instanceof RedirectCommand) {
      expect(mockToastService.danger).toHaveBeenCalledTimes(1);
    }
  });

  it('should redirect to home when promoType is invalid', async () => {
    // Arrange
    mockParamMap.set('promoType', 'Invalid'); // Invalid promo type
    mockParamMap.set('wholeCode', '12345');

    mockRouter.parseUrl.and.returnValue({ commands: ['/'] } as any);

    // Act
    const result = await executeResolver(mockActivatedRouteSnapshot, {} as RouterStateSnapshot);


    // Assert
    expect(mockToastService.danger).toHaveBeenCalledWith('ไม่สามารถค้นหาร้านได้');
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('');
  });

  it('should redirect to home when wholeCode is missing', async () => {
    // Arrange
    const promoType: TPromotionType = 'Monthly';
    mockParamMap.set('promoType', promoType);
    // wholeCode is not set

    mockRouter.parseUrl.and.returnValue({ commands: ['/'] } as any);

    // Act
    const result = await executeResolver(mockActivatedRouteSnapshot, {} as RouterStateSnapshot);


    // Assert
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('notfound');
    if (result instanceof RedirectCommand) {
      expect(mockToastService.danger).toHaveBeenCalledTimes(1);
    }
  });

  it('should handle all valid promoType values', () => {
    const validPromoTypes: TPromotionType[] = ['SP', 'Hot', 'Monthly'];
    const isBkk = true
    const isNew = true
    const wholeType: TWhole = 'Normal'
    const token = "token"
    const idPromotion = '1'

    mockParamMap.set('isBkk', isBkk)
    mockParamMap.set('isNew', isNew)
    mockParamMap.set('wholeType', wholeType)
    mockParamMap.set('token', token)
    mockParamMap.set('idPromotion', idPromotion)

    validPromoTypes.forEach(async (promoType) => {
      // Arrange
      mockParamMap.clear();
      mockParamMap.set('promoType', promoType);
      mockParamMap.set('isBkk', isBkk)
      mockParamMap.set('isNew', isNew)
      mockParamMap.set('wholeType', wholeType)
      mockParamMap.set('token', token)
      mockParamMap.set('idPromotion', idPromotion)

      const mockPrice: TPrice = {
        price: 100,
        priceGold: 80,
        priceSilver: 90,
        priceStandard: 100
      };

      const mockItem: TItem = {
        goodCode: 'G001',
        goodName: 'Test Item',
        barCode: 'B001',
        price: mockPrice
      };

      const mockItemList: TItemList = {
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
        wholeName: 'Test Whole',
        wholeType: 'Normal',
        zone: 'BKK',
        promotionType: promoType,
        isNewCustomer: 'NC',
        promotion: [mockItem]
      };

      mockProchureService.getBrochureList.and.returnValue(of(mockItemList));

      // Act
      const result = await executeResolver(mockActivatedRouteSnapshot, {} as RouterStateSnapshot);

      // Assert
      expect(mockProchureService.getBrochureList).toHaveBeenCalledWith({ isBkk, wholeType, token, idPromotion, isNewCustomer: isNew, promoType } satisfies TMarketingParams);
    });
  });
});
