import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Room {
  id: number;
  name: string;
  description?: string;
  capacity: number;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  capacity: number;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private http = inject(HttpClient);

  private url(tenantId: number) {
    return `${environment.apiUrl}/tenants/${tenantId}/rooms`;
  }

  getAll(tenantId: number): Observable<Room[]> {
    return this.http.get<Room[]>(this.url(tenantId));
  }

  create(tenantId: number, body: CreateRoomRequest): Observable<Room> {
    return this.http.post<Room>(this.url(tenantId), body);
  }

  update(tenantId: number, id: number, body: CreateRoomRequest): Observable<Room> {
    return this.http.put<Room>(`${this.url(tenantId)}/${id}`, body);
  }

  delete(tenantId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url(tenantId)}/${id}`);
  }
}
