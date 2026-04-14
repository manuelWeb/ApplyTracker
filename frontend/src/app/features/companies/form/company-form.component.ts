import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CompaniesService } from '../../../core/services/companies.service';
import { Company } from '../../../shared/models/models';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div style="max-width: 640px">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? 'Edit Company' : 'New Company' }}</h1>
        <a routerLink="/companies" class="btn btn-secondary">← Back</a>
      </div>

      @if (error) {
        <div class="alert alert-error">{{ error }}</div>
      }

      <div class="card">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-group">
            <label for="name">Company Name *</label>
            <input
              id="name"
              type="text"
              class="form-control"
              [(ngModel)]="model.name"
              name="name"
              required
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div class="form-group">
            <label for="industry">Industry</label>
            <input
              id="industry"
              type="text"
              class="form-control"
              [(ngModel)]="model.industry"
              name="industry"
              placeholder="e.g. Technology, Finance"
            />
          </div>

          <div class="form-group">
            <label for="website">Website</label>
            <input
              id="website"
              type="url"
              class="form-control"
              [(ngModel)]="model.website"
              name="website"
              placeholder="https://example.com"
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
              placeholder="Any notes about this company..."
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
            <a routerLink="/companies" class="btn btn-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CompanyFormComponent implements OnInit {
  isEdit = false;
  loading = false;
  error = '';

  model: Partial<Company> = {
    name: '',
    industry: '',
    website: '',
    notes: '',
  };

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(CompaniesService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.service.getOne(id).subscribe({
        next: (company) => {
          this.model = {
            name: company.name,
            industry: company.industry,
            website: company.website,
            notes: company.notes,
          };
        },
        error: () => this.router.navigate(['/companies']),
      });
    }
  }

  onSubmit(): void {
    if (this.loading) return;
    this.error = '';
    this.loading = true;

    const id = this.route.snapshot.paramMap.get('id');
    const payload = { ...this.model };
    if (!payload.website) delete payload.website;

    const request = this.isEdit
      ? this.service.update(id!, payload)
      : this.service.create(payload);

    request.subscribe({
      next: () => this.router.navigate(['/companies']),
      error: (err) => {
        this.error = err?.error?.message || 'Save failed';
        this.loading = false;
      },
    });
  }
}
