import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PackageService } from '../../core/services/package.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { TreatmentPackage, CreateTreatmentPackageRequest } from '../../core/models/package.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-packages',
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule, MatDialogModule, TranslateModule],
  templateUrl: './packages.component.html',
})
export class PackagesComponent implements OnInit {
  private service = inject(PackageService);
  private tenantCtx = inject(TenantContextService);

  packages = signal<TreatmentPackage[]>([]);
  loading = signal(true);

  showForm = signal(false);
  saving = signal(false);
  editingId = signal<number | null>(null);

  form: CreateTreatmentPackageRequest = {
    name: '',
    description: '',
    totalSessions: 1,
    price: 0,
    validityDays: 365,
  };

  ngOnInit() { this.load(); }

  load() {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.loading.set(true);
    this.service.getAll(id).subscribe({
      next: (list) => { this.packages.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.form = { name: '', description: '', totalSessions: 1, price: 0, validityDays: 365 };
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEdit(pkg: TreatmentPackage) {
    this.form = {
      name: pkg.name,
      description: pkg.description ?? '',
      serviceId: pkg.serviceId,
      totalSessions: pkg.totalSessions,
      price: pkg.price,
      validityDays: pkg.validityDays,
    };
    this.editingId.set(pkg.id);
    this.showForm.set(true);
  }

  save() {
    const tenantId = this.tenantCtx.tenantId()!;
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.service.update(tenantId, id, this.form)
      : this.service.create(tenantId, this.form);

    req.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  delete(id: number) {
    const tenantId = this.tenantCtx.tenantId()!;
    this.service.delete(tenantId, id).subscribe(() => this.load());
  }

  cancel() {
    this.showForm.set(false);
  }

  formatCurrency(val: number): string {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
