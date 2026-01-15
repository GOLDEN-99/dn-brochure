// Mock Router
{ provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) }

// Mock ActivatedRoute
{
provide: ActivatedRoute,
useValue: {
params: of({ id: '1' }),
queryParams: of({}),
data: of({ resolved: mockData }),
snapshot: { params: { id: '1' } }
}
}

// Mock your ApiService
{ provide: ApiService, useValue: jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']) }
