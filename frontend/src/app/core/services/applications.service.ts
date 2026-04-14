import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private readonly base = '/api/applications';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Application[]> {
    return this.http.get<Application[]>(this.base);
  }

  getOne(id: string): Observable<Application> {
    return this.http.get<Application>(`${this.base}/${id}`);
  }

  create(data: Partial<Application>): Observable<Application> {
    return this.http.post<Application>(this.base, data);
  }

  update(id: string, data: Partial<Application>): Observable<Application> {
    return this.http.put<Application>(`${this.base}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
