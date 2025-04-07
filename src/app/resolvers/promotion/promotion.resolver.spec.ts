import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RedirectCommand, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';

import { promotionResolver } from './promotion.resolver';
import { TItem, TItemList, TPrice, TPromotionType } from '../../types';
import { Observable, of, throwError } from 'rxjs';
import { ToastService } from '../../service/toast/toast.service';
import { ProchureService } from '../../service/brochure/prochure/prochure.service';


describe('promotionResolver', () => {
  const executeResolver: ResolveFn<TItemList> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => promotionResolver(...resolverParameters));

  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockProchureService: jasmine.SpyObj<ProchureService>;
  let mockActivatedRouteSnapshot: jasmine.SpyObj<ActivatedRouteSnapshot>;
  let mockParamMap: Map<string, string>;


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
        { provide: ProchureService, useValue: mockProchureService }
      ]
    });


  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });

  it('should return prochure list when valid parameters are provided', async () => {
    // Arrange
    const promoType: TPromotionType = 'SP';
    const wholeCode = '12345';

    mockParamMap.set('promoType', promoType);
    mockParamMap.set('wholeCode', wholeCode);

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

    mockProchureService.getProchureList.and.returnValue(of(mockItemList));
    mockRouter.parseUrl.and.returnValue({ commands: [] } as any);

    // Act
    const result = await executeResolver(mockActivatedRouteSnapshot, {} as RouterStateSnapshot);

    // Assert
    expect(mockProchureService.getProchureList).toHaveBeenCalledWith(wholeCode, promoType)
    if (result instanceof Observable) {
      result.subscribe(data => expect(data).toEqual(mockItemList))
    }

  });

  it('should handle errors from ProchureService', async () => {
    // Arrange
    const promoType: TPromotionType = 'Hot';
    const wholeCode = '67890';

    mockParamMap.set('promoType', promoType);
    mockParamMap.set('wholeCode', wholeCode);

    mockProchureService.getProchureList.and.returnValue(throwError(() => new Error('Service error')));

    // Act
    const result = await executeResolver(mockActivatedRouteSnapshot, {} as RouterStateSnapshot);
    // Assert
    expect(mockProchureService.getProchureList).toHaveBeenCalledWith(wholeCode, promoType);
    // 
    if (result instanceof RedirectCommand) {
      expect(mockToastService.danger).toHaveBeenCalledWith("ไม่สามารถค้นหาร้านได้");
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
    expect(mockToastService.danger).toHaveBeenCalledWith('ไม่สามารถค้นหาร้านได้');
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('');
  });

  it('should handle all valid promoType values', () => {
    const validPromoTypes: TPromotionType[] = ['SP', 'Hot', 'Monthly'];
    const wholeCode = '12345';

    validPromoTypes.forEach(async (promoType) => {
      // Arrange
      mockParamMap.clear();
      mockParamMap.set('promoType', promoType);
      mockParamMap.set('wholeCode', wholeCode);

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

      mockProchureService.getProchureList.and.returnValue(of(mockItemList));

      // Act
      const result = await executeResolver(mockActivatedRouteSnapshot, {} as RouterStateSnapshot);

      // Assert
      expect(mockProchureService.getProchureList).toHaveBeenCalledWith(wholeCode, promoType);
    });
  });
});
