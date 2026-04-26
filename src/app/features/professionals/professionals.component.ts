import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { ProfessionalService } from '../../core/services/professional.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { Professional } from '../../core/models/professional.model';
import { ProfessionalDialogComponent } from './professional-dialog.component';

@Component({
  selector: 'app-professionals',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatChipsModule, TranslateModule],
  templateUrl: './professionals.component.html',
})
export class ProfessionalsComponent implements OnInit {
  private service = inject(ProfessionalService);
  private tenantCtx = inject(TenantContextService);
  private dialog = inject(MatDialog);

  professionals = signal<Professional[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.load();
  }

  load() {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.loading.set(true);
    this.service.getAll(id).subscribe({
      next: (list) => { this.professionals.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openDialog(professional?: Professional) {
    const tenantId = this.tenantCtx.tenantId()!;
    this.dialog.open(ProfessionalDialogComponent, {
      data: { tenantId, professional },
      width: '520px',
      maxHeight: '90vh',
    }).afterClosed().subscribe(result => {
      if (result) this.load();
    });
  }

  delete(id: number) {
    if (!confirm('Remover este profissional?')) return;
    const tenantId = this.tenantCtx.tenantId()!;
    this.service.delete(tenantId, id).subscribe(() => {
      this.professionals.update(list => list.filter(p => p.id !== id));
    });
  }
}
