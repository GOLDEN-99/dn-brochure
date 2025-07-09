import { inject } from "@angular/core";
import { ApiService } from "../api/api.service";
import { Observable } from "rxjs";

export abstract class BaseOiService {
    protected api = inject(ApiService)
    private baseUrl = ''

    match(invId: number, receId: number) {
        return this.api.post(`${this.baseUrl}/`, { invId, receId })
    }

    getMatch(id: number) {
        this.api.get(`${this.baseUrl}/${id}/matches`)
    }

    getIncome(id: number) {
        return this.api.get(`${this.baseUrl}/${id}/incomes`)
    }

    createTerm(id: number, incomeList: {}) {
        return this.api.post(`${this.baseUrl}/${id}/terms`, incomeList)
    }

    abstract getAll(query: any): Observable<any>
    abstract getById(id: number): Observable<any>
    abstract create(req: any): Observable<any>
    abstract update(id: number, req: any): Observable<any>
}