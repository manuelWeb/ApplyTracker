import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompaniesService } from '../../../core/services/companies.service';
import { Company } from '../../../shared/models/models';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="page-header">
        <h1 class="page-title">Companies</h1>
        <a routerLink="/companies/new" class="btn btn-primary">+ New</a>
      </div>

      @if (loading) {
        <p>Loading...</p>
      } @else if (companies.length === 0) {
        <div class="empty-state card">
          <p>No companies yet.</p>
          <a routerLink="/companies/new" class="btn btn-primary">
            Add your first company
          </a>
        </div>
      } @else {
        <div class="card" style="padding:0; overflow:hidden">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Industry</th>
                <th>Website</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (company of companies; track company.id) {
                <tr>
                  <td>{{ company.name }}</td>
                  <td>{{ company.industry || '—' }}</td>
                  <td>
                    @if (company.website) {
                      <a [href]="company.website" target="_blank" rel="noopener">
                        {{ company.website }}
                      </a>
                    } @else {
                      —
                    }
                  </td>
                  <td>
                    <div style="display:flex; gap:0.5rem">
                      <a
                        [routerLink]="['/companies', company.id, 'edit']"
                        class="btn btn-secondary btn-sm"
                      >Edit</a>
                      <button
                        class="btn btn-danger btn-sm"
                        (click)="delete(company.id)"
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class CompaniesListComponent implements OnInit {
  companies: Company[] = [];
  loading = true;

  private service = inject(CompaniesService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.getAll().subscribe({
      next: (data) => {
        this.companies = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this company?')) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.companies = this.companies.filter((c) => c.id !== id);
      },
    });
  }
}
