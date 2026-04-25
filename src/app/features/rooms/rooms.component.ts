import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { RoomService, Room } from '../../core/services/room.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { RoomDialogComponent } from './room-dialog.component';

@Component({
  selector: 'app-rooms',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Salas</h1>
          <p class="text-slate-500 text-sm">Salas e espaços físicos da clínica</p>
        </div>
        <button mat-flat-button (click)="openDialog()"><mat-icon>add</mat-icon> Nova sala</button>
      </div>
      @if (loading()) {
        <div class="flex justify-center py-16"><mat-spinner diameter="40" /></div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (r of rooms(); track r.id) {
            <div class="bg-white rounded-xl border border-slate-200 p-5">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-indigo-500">meeting_room</mat-icon>
                  <h3 class="font-semibold text-slate-800">{{ r.name }}</h3>
                </div>
                <div class="flex gap-1">
                  <button mat-icon-button (click)="openDialog(r)"><mat-icon class="text-slate-400 text-[18px]">edit</mat-icon></button>
                  <button mat-icon-button (click)="delete(r.id)"><mat-icon class="text-red-400 text-[18px]">delete</mat-icon></button>
                </div>
              </div>
              @if (r.description) { <p class="text-sm text-slate-500 mb-2">{{ r.description }}</p> }
              <p class="text-sm text-slate-500">Capacidade: {{ r.capacity }}</p>
            </div>
          }
          @if (rooms().length === 0) {
            <div class="col-span-3 py-12 text-center text-slate-400">
              <mat-icon class="text-5xl">meeting_room</mat-icon>
              <p class="mt-2">Nenhuma sala cadastrada</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class RoomsComponent implements OnInit {
  private service = inject(RoomService);
  private tenantCtx = inject(TenantContextService);
  private dialog = inject(MatDialog);

  rooms = signal<Room[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.load();
  }

  load() {
    const id = this.tenantCtx.tenantId();
    if (!id) return;
    this.loading.set(true);
    this.service.getAll(id).subscribe({
      next: (list) => { this.rooms.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openDialog(room?: Room) {
    const tenantId = this.tenantCtx.tenantId()!;
    this.dialog.open(RoomDialogComponent, {
      data: { tenantId, room },
      width: '440px',
    }).afterClosed().subscribe(result => {
      if (result) this.load();
    });
  }

  delete(id: number) {
    if (!confirm('Remover esta sala?')) return;
    const tenantId = this.tenantCtx.tenantId()!;
    this.service.delete(tenantId, id).subscribe(() => {
      this.rooms.update(list => list.filter(r => r.id !== id));
    });
  }
}
