import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { TenantContextService } from '../../core/services/tenant-context.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatTooltipModule, MatBadgeModule,
    CommonModule,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  tenantCtx = inject(TenantContextService);

  sidebarOpen = signal(true);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Agendamentos', icon: 'calendar_today', route: '/dashboard/appointments' },
    { label: 'Profissionais', icon: 'medical_services', route: '/dashboard/professionals' },
    { label: 'Pacientes', icon: 'people', route: '/dashboard/patients' },
    { label: 'Serviços', icon: 'design_services', route: '/dashboard/services' },
    { label: 'Salas', icon: 'meeting_room', route: '/dashboard/rooms' },
  ];

  bottomItems: NavItem[] = [
    { label: 'Configurações', icon: 'settings', route: '/dashboard/settings' },
    { label: 'Assinatura', icon: 'credit_card', route: '/dashboard/subscription' },
  ];

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  logout() {
    this.auth.logout();
  }
}
