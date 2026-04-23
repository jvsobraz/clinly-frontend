import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ProfessionalService } from '../../core/services/professional.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { Professional } from '../../core/models/professional.model';

@Component({
  selector: 'app-professionals',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatChipsModule],
  templateUrl: './professionals.component.html',
})
export class ProfessionalsComponent implements OnInit {
  private service = inject(ProfessionalService);
  private tenantCtx = inject(TenantContextService);

  professionals = signal<Professional[]>([]);
  loading = signal(true);

  ngOnInit() {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.service.getAll(id).subscribe({
      next: (list) => { this.professionals.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  delete(id: number) {
    const tenantId = this.tenantCtx.tenantId()!;
    this.service.delete(tenantId, id).subscribe(() => {
      this.professionals.update(list => list.filter(p => p.id !== id));
    });
  }
}
