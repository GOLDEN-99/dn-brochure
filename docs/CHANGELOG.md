# API Documentation Changelog

All notable changes to the Other Income API will be documented in this file.

---

## [Unreleased]

### Planned
- Add authentication documentation when implemented
- Document error response formats and codes
- Add webhook documentation (if applicable)
- Create Postman collection export

---

## [1.0.0] - 2026-01-08

### Added
- **Initial API Documentation**
  - Documented 33+ API endpoints
  - Base URL: `https://api.otherincome.healthupgroup.com`
  - Created comprehensive API reference guide
  - Added usage examples for common workflows
  - Documented all request/response types

- **Master Data APIs** (6 endpoints)
  - Branch search
  - Company search
  - Discount list
  - Event list
  - Income types
  - Product search

- **Contact Management APIs** (12 endpoints)
  - Light contact CRUD operations
  - Not-light contact CRUD operations
  - Contact head creation
  - Branch management

- **Period Management APIs** (7 endpoints)
  - Period creation and queries
  - Order, invoice, receipt, credit note operations
  - Period metadata updates

- **Purchase Order APIs** (2 endpoints)
  - PO bills by company
  - PO goods by company

- **Monthly Income APIs** (6 endpoints)
  - Income list queries
  - Light/not-light income operations
  - Branch management
  - Delete operations

- **Report APIs** (13 endpoints)
  - Account reports (invoices, receipts, annual, monthly, range)
  - Supplier reports (monthly, detail, annual)

- **Documentation Files**
  - `docs/API_REFERENCE.md` - Complete endpoint reference
  - `docs/EXAMPLES.md` - Common usage patterns
  - `docs/CHANGELOG.md` - API version history

### Documentation Improvements
- Added TypeScript type definitions for all requests/responses
- Included code examples for every endpoint
- Documented company type parameters (`DN` vs `HU`)
- Added notes for important edge cases
- Created comprehensive workflow examples

---

## Future Improvements

### Short Term
- [ ] Add JSDoc comments to service files
- [ ] Create TypeDoc generated documentation
- [ ] Add more workflow examples
- [ ] Document environment configuration

### Medium Term
- [ ] Generate OpenAPI/Swagger specification
- [ ] Create Postman collection for API testing
- [ ] Add authentication/authorization documentation
- [ ] Document rate limiting (if applicable)

### Long Term
- [ ] Interactive API playground
- [ ] Automated API documentation testing
- [ ] CI/CD integration for doc updates
- [ ] API versioning strategy

---

## Notes

### Date Format Standards
All dates use ISO 8601 format:
- Full timestamp: `2026-01-01T00:00:00`
- Month format: `2026-01`
- Year format: `2026`

### Company Types
- `DN` - DrugNet
- `HU` - HealthUp

### Income Types
1. **Order (ท้ายบิล)** - incomeType: 1
2. **Good Order (สินค้า)** - incomeType: 2
3. **Invoice/Receipt** - incomeType: 3
4. **Credit Note** - incomeType: 4

### Period Types
1. **Annual** - period: 1
2. **Half-year** - period: 2
3. **Quarter** - period: 3
4. **Month** - period: 4

---

**Maintained By:** Development Team
**Last Updated:** 2026-01-08
