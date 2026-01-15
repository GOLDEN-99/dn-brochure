# Project Coding Guidelines

## API Endpoints

| Key                | Base URL                                              | Description                |
| ------------------ | ----------------------------------------------------- | -------------------------- |
| `brochureEndpoint` | `https://api.drugnetcenter.com/ItemService2`          | Product/Item services      |
| `imagePath`        | `https://file.drugnetcenter.com/drugpos/GoodPictures` | Product image assets       |
| `cnPath`           | `https://api.drugnetcenter.com/ReturnRequest`         | Return/CN request services |
| `ibob`             | `https://api.drugnetcenter.com/IbOb`                  | IB/OB transfer services    |
| `oi`               | `https://api.otherincome.healthupgroup.com`           | Other income services      |

> **Note:** Detailed endpoint documentation for each service should be maintained in separate files under `/docs/api/`.

---

## State Management

### Synchronous State (Signal-based)

Use Angular's **signal-based reactivity** for all synchronous state management.

#### Template Binding

- Use `signal()` for primitive reactive values
- Use `computed()` for derived state
- Use control flow directives: `@if`, `@for`, `@switch`

```typescript
// Example
count = signal(0);
doubled = computed(() => this.count() * 2);
```

#### Form State

- Use signal primitives for simple forms
- For complex forms, use object signals with `computed()` selectors
- Update state using curried `signal.update()` pattern

```typescript
// Example
form = signal({ name: "", email: "" });
updateField = (field: string) => (value: string) => this.form.update((f) => ({ ...f, [field]: value }));
```

#### Component Communication

- **Input:** Use `input()` signal inputs with `effect()` or computed for reactions
- **Output:** Use `output()` for event emission
- **Two-way:** Use `model()` for two-way binding when stable

```typescript
// Example
value = input.required<string>();
valueChange = output<string>();
```

---

### Asynchronous State (Observable + Signal)

#### Data Fetching

- Convert `Observable` to signal using `toSignal()` for template consumption
- Use `Resolver` for route-level data prefetching

```typescript
// Flow: Resolver → Service → Component
// resolver fetches → service provides → component displays
```

#### Mutations

- Use `subscribe()` for mutation side effects (POST, PUT, DELETE)
- Handle loading/error states explicitly

```typescript
// Example
this.service.update(data).subscribe({
  next: () => this.refetch(),
  error: (err) => this.handleError(err),
});
```

---

## Unit Testing

### New Code

- **Required:** All new components, services, and utilities must include unit tests

### Existing Code

- Add unit tests when modifying existing code
- Add unit tests during downtime when no active tasks are assigned

### Testing Approach

- Test component behavior, not implementation details
- Mock services and HTTP calls
- Test signal reactivity and computed values

// how to mock
Mock Router

```typescript
{ provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) }
```

Mock ActivatedRoute

```typescript
{
    provide: ActivatedRoute,
    useValue: {
        params: of({ id: '1' }),
        queryParams: of({}),
        data: of({ resolved: mockData }),
        snapshot: {
            params: { id: '1' }
        }
    }
}
```

Mock your ApiService

```typescript
{
    provide: ApiService,
    useValue: jasmine.createSpyObj(
        'ApiService',
        ['get', 'post', 'put', 'delete']
    )
}
```

---

## API Documentation Structure

Organize API documentation by **feature/domain**, not by endpoint base URL.

```
/docs/api/
  ├── brochure/
  │   ├── products.md
  │   └── categories.md
  ├── returns/
  │   └── cn-request.md
  ├── transfers/
  │   └── ib-ob.md
  └── other-income/
      └── transactions.md
```
