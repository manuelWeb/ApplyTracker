import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <h1 class="auth-title">Create account</h1>
        <p class="auth-subtitle">Start tracking your job applications</p>

        @if (error) {
          <div class="alert alert-error">{{ error }}</div>
        }

        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-group">
            <label for="name">Full name</label>
            <input
              id="name"
              type="text"
              class="form-control"
              [(ngModel)]="name"
              name="name"
              required
              minlength="2"
              placeholder="Jane Smith"
            />
          </div>

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
              minlength="8"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            style="width:100%"
            [disabled]="loading || form.invalid"
          >
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <p class="auth-link">
          Already have an account? <a routerLink="/login">Sign in</a>
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
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  private auth = inject(AuthService);

  onSubmit(): void {
    if (this.loading) return;
    this.error = '';
    this.loading = true;

    this.auth.register(this.email, this.password, this.name).subscribe({
      next: () => {},
      error: (err) => {
        this.error = err?.error?.message || 'Registration failed';
        this.loading = false;
      },
    });
  }
}
