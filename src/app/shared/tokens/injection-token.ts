import { InjectionToken } from "@angular/core";

export interface IVersion {
    version: string
}

export const VERSION_TOKEN = new InjectionToken<IVersion>('version');