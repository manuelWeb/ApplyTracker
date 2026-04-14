import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../shared/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
      </div>

      <p class="greeting">Hello, {{ auth.getUser()?.name }} 👋</p>

      @if (loading) {
        <p>Loading stats...</p>
      } @else if (stats) {
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total Applications</div>
          </div>
          <div class="stat-card card badge-wishlist">
            <div class="stat-value">{{ stats.byStatus['wishlist'] }}</div>
            <div class="stat-label">Wishlist</div>
          </div>
          <div class="stat-card card badge-applied">
            <div class="stat-value">{{ stats.byStatus['applied'] }}</div>
            <div class="stat-label">Applied</div>
          </div>
          <div class="stat-card card badge-interview">
            <div class="stat-value">{{ stats.byStatus['interview'] }}</div>
            <div class="stat-label">Interview</div>
          </div>
          <div class="stat-card card badge-offer">
            <div class="stat-value">{{ stats.byStatus['offer'] }}</div>
            <div class="stat-label">Offer</div>
          </div>
          <div class="stat-card card badge-rejected">
            <div class="stat-value">{{ stats.byStatus['rejected'] }}</div>
            <div class="stat-label">Rejected</div>
          </div>
        </div>

        <div class="quick-actions">
          <a routerLink="/applications/new" class="btn btn-primary">
            + New Application
          </a>
          <a routerLink="/applications" class="btn btn-secondary">
            View All Applications
          </a>
          <a routerLink="/companies" class="btn btn-secondary">
            Manage Companies
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .greeting {
      color: #718096;
      margin-bottom: 1.5rem;
      font-size: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      text-align: center;
      padding: 1.25rem 1rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1;
      margin-bottom: 0.4rem;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 600;
    }

    .quick-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
  `],
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  auth = inject(AuthService);
  private dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
