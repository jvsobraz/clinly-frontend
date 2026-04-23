export interface Tenant {
  id: number;
  name: string;
  slug: string;
  cnpj?: string;
  phone?: string;
  address?: string;
  primaryColor?: string;
  logoUrl?: string;
  welcomeMessage?: string;
  isActive: boolean;
  createdAt: string;
  subscription?: TenantSubscription;
}

export interface TenantSubscription {
  planName: string;
  status: string;
  expiresAt?: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  cnpj?: string;
  phone?: string;
  address?: string;
}

export interface UpdateTenantRequest {
  name: string;
  phone?: string;
  address?: string;
  primaryColor?: string;
  welcomeMessage?: string;
}
