import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { BaseOiService } from './base-oi';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OiLightService extends BaseOiService {

  private url = environment.oi

  getAll(query: {}) {
    return this.api.get(`${this.url}/other-income/contact/light`, { params: query })
  }

  getById(id: number) {
    return this.api.get(`${this.url}/${id}`)
  }

  create(req: {}) {
    return this.api.post(this.url, {})
  }

  update(id: number, body: {}) {
    return this.api.post(`${this.url}/${id}`, body)
  }

  addBranch(id: number, body: {}) {
    return this.api.post(`${this.url}/${id}/branch`, body)
  }

}
