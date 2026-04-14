import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationsService } from '../../../core/services/applications.service';
import { Application } from '../../../shared/models/models';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="page-header">
        <h1 class="page-title">Applications</h1>
        <a routerLink="/applications/new" class="btn btn-primary">+ New</a>
      </div>

      @if (loading) {
        <p>Loading...</p>
      } @else if (applications.length === 0) {
        <div class="empty-state card">
          <p>No applications yet.</p>
          <a routerLink="/applications/new" class="btn btn-primary">
            Add your first application
          </a>
        </div>
      } @else {
        <div class="card" style="padding:0; overflow:hidden">
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Company</th>
                <th>Status</th>
                <th>Location</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (app of applications; track app.id) {
                <tr>
                  <td>{{ app.position }}</td>
                  <td>{{ app.company?.name || '—' }}</td>
                  <td>
                    <span [class]="'badge badge-' + app.status">
                      {{ app.status }}
                    </span>
                  </td>
                  <td>{{ app.location || '—' }}</td>
                  <td>{{ app.appliedDate ? (app.appliedDate | date: 'mediumDate') : '—' }}</td>
                  <td>
                    <div style="display:flex; gap:0.5rem">
                      <a
                        [routerLink]="['/applications', app.id, 'edit']"
                        class="btn btn-secondary btn-sm"
                      >Edit</a>
                      <button
                        class="btn btn-danger btn-sm"
                        (click)="delete(app.id)"
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
export class ApplicationsListComponent implements OnInit {
  applications: Application[] = [];
  loading = true;

  private service = inject(ApplicationsService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.getAll().subscribe({
      next: (data) => {
        this.applications = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this application?')) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.applications = this.applications.filter((a) => a.id !== id);
      },
    });
  }
}
