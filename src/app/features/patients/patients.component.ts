import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { PatientService } from '../../core/services/patient.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { Patient } from '../../core/models/patient.model';
import { PatientDialogComponent } from './patient-dialog.component';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-patients',
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatTooltipModule, TranslateModule],
  templateUrl: './patients.component.html',
})
export class PatientsComponent implements OnInit {
  private service = inject(PatientService);
  private tenantCtx = inject(TenantContextService);
  private dialog = inject(MatDialog);

  patients = signal<Patient[]>([]);
  loading = signal(true);
  searchText = '';
  private search$ = new Subject<string>();

  ngOnInit() {
    this.load();
    this.search$.pipe(debounceTime(400)).subscribe(q => this.load(q));
  }

  load(search?: string) {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.loading.set(true);
    this.service.getAll(id, search).subscribe({
      next: (list) => { this.patients.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onSearch(q: string) {
    this.search$.next(q);
  }

  openDialog(patient?: Patient) {
    const tenantId = this.tenantCtx.tenantId()!;
    this.dialog.open(PatientDialogComponent, {
      data: { tenantId, patient },
      width: '520px',
      maxHeight: '90vh',
    }).afterClosed().subscribe(result => {
      if (result) this.load(this.searchText || undefined);
    });
  }
}
