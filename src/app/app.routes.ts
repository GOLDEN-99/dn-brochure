import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { ProchurePageComponent } from './pages/prochure-page/prochure-page.component';

export const routes: Routes = [
    {
        path: "prochure",
        component: ProchurePageComponent
    },
    {
        path: "",
        pathMatch: "full",
        component: SearchPageComponent
    },
    {
        path: "**",
        redirectTo: ""
    }
];
