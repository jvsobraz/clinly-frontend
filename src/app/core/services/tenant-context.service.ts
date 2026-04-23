import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private _tenantId = signal<number | null>(this.loadTenantId());
  private _tenantName = signal<string>('');

  readonly tenantId = this._tenantId.asReadonly();
  readonly tenantName = this._tenantName.asReadonly();
  readonly hasTenant = computed(() => this._tenantId() !== null);

  private loadTenantId(): number | null {
    const raw = localStorage.getItem('clinly_tenant_id');
    return raw ? parseInt(raw, 10) : null;
  }

  setTenant(id: number, name: string): void {
    localStorage.setItem('clinly_tenant_id', id.toString());
    this._tenantId.set(id);
    this._tenantName.set(name);
  }

  clear(): void {
    localStorage.removeItem('clinly_tenant_id');
    this._tenantId.set(null);
    this._tenantName.set('');
  }
}
