import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { LanguageService } from '../../core/services/language.service';

interface NavItem {
  key: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatTooltipModule, MatBadgeModule,
    CommonModule, TranslateModule,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  tenantCtx = inject(TenantContextService);
  lang = inject(LanguageService);

  sidebarOpen = signal(true);

  navItems: NavItem[] = [
    { key: 'nav.dashboard', icon: 'dashboard', route: '/dashboard' },
    { key: 'nav.appointments', icon: 'calendar_today', route: '/dashboard/appointments' },
    { key: 'nav.professionals', icon: 'medical_services', route: '/dashboard/professionals' },
    { key: 'nav.patients', icon: 'people', route: '/dashboard/patients' },
    { key: 'nav.services', icon: 'design_services', route: '/dashboard/services' },
    { key: 'nav.rooms', icon: 'meeting_room', route: '/dashboard/rooms' },
    { key: 'nav.waitlist', icon: 'queue', route: '/dashboard/waitlist' },
    { key: 'nav.packages', icon: 'inventory_2', route: '/dashboard/packages' },
    { key: 'nav.financial', icon: 'payments', route: '/dashboard/financial' },
  ];

  bottomItems: NavItem[] = [
    { key: 'nav.settings', icon: 'settings', route: '/dashboard/settings' },
    { key: 'nav.subscription', icon: 'credit_card', route: '/dashboard/subscription' },
  ];

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  logout() {
    this.auth.logout();
  }
}
