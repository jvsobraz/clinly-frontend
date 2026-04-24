import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse, LoginRequest, RegisterRequest,
  RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest,
} from '../models/auth.model';
import { TenantContextService } from './tenant-context.service';

const TOKEN_KEY = 'clinly_token';
const REFRESH_KEY = 'clinly_refresh';
const USER_KEY = 'clinly_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tenantCtx = inject(TenantContextService);
  private api = `${environment.apiUrl}/auth`;

  private _user = signal<AuthResponse['user'] | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isAdmin = computed(() => {
    const role = this._user()?.role;
    return role === 'SuperAdmin' || role === 'ClinicAdmin';
  });

  private loadUser(): AuthResponse['user'] | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, body).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(body: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, body).pipe(
      tap(res => this.saveSession(res))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const body: RefreshTokenRequest = { refreshToken: localStorage.getItem(REFRESH_KEY) ?? '' };
    return this.http.post<AuthResponse>(`${this.api}/refresh-token`, body).pipe(
      tap(res => this.saveSession(res))
    );
  }

  forgotPassword(body: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.api}/forgot-password`, body);
  }

  resetPassword(body: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.api}/reset-password`, body);
  }

  logout(): void {
    this.http.post(`${this.api}/logout`, {}).subscribe({ error: () => {} });
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.tenantCtx.clear();
    this.router.navigate(['/auth/login']);
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._token.set(res.token);
    this._user.set(res.user);
    if (res.user.clinicId) {
      this.tenantCtx.setTenant(res.user.clinicId, res.user.clinicName ?? '');
    }
  }
}
