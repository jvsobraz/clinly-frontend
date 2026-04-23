import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private tenantCtx = inject(TenantContextService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: [''],
    address: [''],
    primaryColor: ['#6366f1'],
    welcomeMessage: [''],
  });

  loading = signal(true);
  saving = signal(false);
  saved = signal(false);

  ngOnInit() {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.http.get<any>(`${environment.apiUrl}/tenants/${id}`).subscribe({
      next: (t) => {
        this.form.patchValue(t);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save() {
    if (this.form.invalid) return;
    const id = this.tenantCtx.tenantId()!;
    this.saving.set(true);
    this.http.put(`${environment.apiUrl}/tenants/${id}`, this.form.getRawValue()).subscribe({
      next: () => { this.saved.set(true); this.saving.set(false); setTimeout(() => this.saved.set(false), 3000); },
      error: () => this.saving.set(false),
    });
  }
}
