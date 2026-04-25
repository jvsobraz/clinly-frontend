import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'landing', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },

  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./layout/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'appointments', loadComponent: () => import('./features/appointments/appointments.component').then(m => m.AppointmentsComponent) },
      { path: 'professionals', loadComponent: () => import('./features/professionals/professionals.component').then(m => m.ProfessionalsComponent) },
      { path: 'patients', loadComponent: () => import('./features/patients/patients.component').then(m => m.PatientsComponent) },
      { path: 'patients/:id/intelligence', loadComponent: () => import('./features/patients/patient-detail/patient-detail.component').then(m => m.PatientDetailComponent) },
      { path: 'services', loadComponent: () => import('./features/clinic-services/clinic-services.component').then(m => m.ClinicServicesComponent) },
      { path: 'rooms', loadComponent: () => import('./features/rooms/rooms.component').then(m => m.RoomsComponent) },
      { path: 'waitlist', loadComponent: () => import('./features/waitlist/waitlist.component').then(m => m.WaitlistComponent) },
      { path: 'packages', loadComponent: () => import('./features/packages/packages.component').then(m => m.PackagesComponent) },
      { path: 'financial', loadComponent: () => import('./features/financial/financial.component').then(m => m.FinancialComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'subscription', loadComponent: () => import('./features/subscription/subscription.component').then(m => m.SubscriptionComponent) },
    ],
  },

  {
    path: 'patient',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/patient-layout/patient-layout.component').then(m => m.PatientLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/patient-portal/portal-home.component').then(m => m.PortalHomeComponent) },
      { path: 'appointments', loadComponent: () => import('./features/patient-portal/portal-appointments.component').then(m => m.PortalAppointmentsComponent) },
    ],
  },

  { path: 'booking/:slug', loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent) },
  { path: 'offer/:token', loadComponent: () => import('./features/offer/offer.component').then(m => m.OfferComponent) },
  { path: 'nps/:token', loadComponent: () => import('./features/nps/nps.component').then(m => m.NpsComponent) },

  { path: '**', redirectTo: '/' },
];
