import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  private url(tenantId: number) {
    return `${environment.apiUrl}/tenants/${tenantId}/notifications`;
  }

  getAll(tenantId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.url(tenantId));
  }

  getUnreadCount(tenantId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.url(tenantId)}/unread-count`);
  }

  markAsRead(tenantId: number, id: number): Observable<void> {
    return this.http.patch<void>(`${this.url(tenantId)}/${id}/read`, {});
  }

  markAllAsRead(tenantId: number): Observable<void> {
    return this.http.post<void>(`${this.url(tenantId)}/read-all`, {});
  }
}
