import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthResponse } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'applytracker_token';
  private readonly USER_KEY = 'applytracker_user';

  isLoggedIn = signal<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  register(email: string, password: string, name: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/register', { email, password, name })
      .pipe(tap((res) => this.storeAuth(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/login', { email, password })
      .pipe(tap((res) => this.storeAuth(res)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private storeAuth(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.isLoggedIn.set(true);
  }
}
