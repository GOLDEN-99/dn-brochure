import { HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";

export type TApiOpt = {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  observe?: 'body';
  params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  reportProgress?: boolean;
  withCredentials?: boolean;
  transferCache?: {
    includeHeaders?: string[];
  } | boolean;
}

export type TOptionable = string | number | Record<string, unknown>

export type TMaybe<T> = T | null