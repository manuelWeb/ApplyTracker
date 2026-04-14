import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to Jobpipe</p>

        @if (error) {
          <div class="alert alert-error">{{ error }}</div>
        }

        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              class="form-control"
              [(ngModel)]="email"
              name="email"
              required
              email
              placeholder="you@example.com"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              class="form-control"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            style="width:100%"
            [disabled]="loading || form.invalid"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <p class="auth-link">
          Don't have an account? <a routerLink="/register">Create one</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f4f7fa;
      padding: 1rem;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
    }
    .auth-title {
      font-size: 1.75rem;
      margin-bottom: 0.25rem;
    }
    .auth-subtitle {
      color: #718096;
      margin-bottom: 1.5rem;
    }
    .auth-link {
      margin-top: 1rem;
      text-align: center;
      font-size: 0.875rem;
      color: #718096;
    }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  private auth = inject(AuthService);

  onSubmit(): void {
    if (this.loading) return;
    this.error = '';
    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: () => {},
      error: (err) => {
        this.error = err?.error?.message || 'Login failed';
        this.loading = false;
      },
    });
  }
}
