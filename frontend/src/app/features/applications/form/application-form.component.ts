import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApplicationsService } from '../../../core/services/applications.service';
import { CompaniesService } from '../../../core/services/companies.service';
import { Application, Company } from '../../../shared/models/models';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="max-width: 640px">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? 'Edit Application' : 'New Application' }}</h1>
        <a routerLink="/applications" class="btn btn-secondary">← Back</a>
      </div>

      @if (error) {
        <div class="alert alert-error">{{ error }}</div>
      }

      <div class="card">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-group">
            <label for="position">Position *</label>
            <input
              id="position"
              type="text"
              class="form-control"
              [(ngModel)]="model.position"
              name="position"
              required
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div class="form-group">
            <label for="company">Company</label>
            <select
              id="company"
              class="form-control"
              [(ngModel)]="model.companyId"
              name="companyId"
            >
              <option value="">— None —</option>
              @for (c of companies; track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="status">Status</label>
            <select
              id="status"
              class="form-control"
              [(ngModel)]="model.status"
              name="status"
            >
              <option value="wishlist">Wishlist</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div class="form-group">
            <label for="location">Location</label>
            <input
              id="location"
              type="text"
              class="form-control"
              [(ngModel)]="model.location"
              name="location"
              placeholder="e.g. Remote, New York"
            />
          </div>

          <div class="form-group">
            <label for="appliedDate">Applied Date</label>
            <input
              id="appliedDate"
              type="date"
              class="form-control"
              [(ngModel)]="model.appliedDate"
              name="appliedDate"
            />
          </div>

          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea
              id="notes"
              class="form-control"
              [(ngModel)]="model.notes"
              name="notes"
              rows="3"
              placeholder="Any notes about this application..."
            ></textarea>
          </div>

          <div style="display:flex; gap:0.75rem">
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="loading || form.invalid"
            >
              {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
            </button>
            <a routerLink="/applications" class="btn btn-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ApplicationFormComponent implements OnInit {
  isEdit = false;
  loading = false;
  error = '';
  companies: Company[] = [];

  model: Partial<Application> = {
    position: '',
    status: 'wishlist',
    location: '',
    notes: '',
    appliedDate: '',
    companyId: '',
  };

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appService = inject(ApplicationsService);
  private companyService = inject(CompaniesService);

  ngOnInit(): void {
    this.companyService.getAll().subscribe((data) => (this.companies = data));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.appService.getOne(id).subscribe({
        next: (app) => {
          this.model = {
            position: app.position,
            status: app.status,
            location: app.location,
            notes: app.notes,
            appliedDate: app.appliedDate,
            companyId: app.companyId,
          };
        },
        error: () => this.router.navigate(['/applications']),
      });
    }
  }

  onSubmit(): void {
    if (this.loading) return;
    this.error = '';
    this.loading = true;

    const id = this.route.snapshot.paramMap.get('id');
    const payload = { ...this.model };
    if (!payload.companyId) delete payload.companyId;
    if (!payload.appliedDate) delete payload.appliedDate;

    const request = this.isEdit
      ? this.appService.update(id!, payload)
      : this.appService.create(payload);

    request.subscribe({
      next: () => this.router.navigate(['/applications']),
      error: (err) => {
        this.error = err?.error?.message || 'Save failed';
        this.loading = false;
      },
    });
  }
}
