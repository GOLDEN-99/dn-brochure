import { Signal } from "@angular/core";

export interface ISerachComp {
    field: Signal<TCompField>
    term: Signal<string>
    compList: Signal<[]>
}

type TQuery = Record<string, string>
type TCompField = 'name' | 'code'