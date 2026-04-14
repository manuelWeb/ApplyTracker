import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private readonly base = '/api/companies';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.base);
  }

  getOne(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.base}/${id}`);
  }

  create(data: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(this.base, data);
  }

  update(id: string, data: Partial<Company>): Observable<Company> {
    return this.http.put<Company>(`${this.base}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
