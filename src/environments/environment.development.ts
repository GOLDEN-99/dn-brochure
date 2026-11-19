export const environment = {
    brochureEndpoint: "https://dev.drugnetcenter.com/ItemService2",
    imagePath: "https://file.drugnetcenter.com/drugpos/GoodPictures",
    cnPath: "https://dev.drugnetcenter.com/ReturnRequest",
    ibob: "https://dev.drugnetcenter.com/IbOb",
    // Other Income / CRM promotion: sandbox API (other-income-api branch dev → ap.local:6351 → Drug_Dev),
    // so sandbox testers and `ng serve` never write to prod Drug. Not resolvable until the DNS record +
    // vhost exist (2026-11-19) — until then these pages fail to load data here; prod is untouched.
    oi: "https://sandbox.otherincome.healthupgroup.com"
};
