import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-wrapper">
      @if (auth.isLoggedIn()) {
        <nav class="sidebar">
          <div class="sidebar-logo">
            <span class="logo-text">Jobpipe</span>
          </div>
          <ul class="nav-list">
            <li>
              <a routerLink="/dashboard" routerLinkActive="active">
                📊 Dashboard
              </a>
            </li>
            <li>
              <a routerLink="/applications" routerLinkActive="active">
                📋 Applications
              </a>
            </li>
            <li>
              <a routerLink="/companies" routerLinkActive="active">
                🏢 Companies
              </a>
            </li>
          </ul>
          <div class="sidebar-footer">
            <span class="user-name">{{ auth.getUser()?.name }}</span>
            <button class="btn btn-secondary btn-sm" (click)="auth.logout()">
              Logout
            </button>
          </div>
        </nav>
        <main class="main-content">
          <router-outlet />
        </main>
      } @else {
        <router-outlet />
      }
    </div>
  `,
  styles: [`
    .app-wrapper {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 220px;
      min-height: 100vh;
      background: #1a1a2e;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      flex-shrink: 0;
    }

    .sidebar-logo {
      margin-bottom: 2rem;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.05em;
    }

    .nav-list {
      list-style: none;
      flex: 1;
    }

    .nav-list li {
      margin-bottom: 0.25rem;
    }

    .nav-list a {
      display: block;
      padding: 0.6rem 0.75rem;
      border-radius: 6px;
      color: #a0aec0;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background-color 0.15s, color 0.15s;
    }

    .nav-list a:hover,
    .nav-list a.active {
      background-color: #4361ee;
      color: #fff;
      text-decoration: none;
    }

    .sidebar-footer {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid #2d3748;
    }

    .user-name {
      font-size: 0.85rem;
      color: #a0aec0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }
  `],
})
export class AppComponent {
  auth = inject(AuthService);
}
