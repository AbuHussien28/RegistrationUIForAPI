import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
export const routes: Routes = [
   {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full' 
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
  path: 'dashboard',
  loadComponent: () =>
    import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  canActivate: [authGuard],
},
 {
  path: 'user-register',
  loadComponent: () => import('./user-register-component/user-register-component.component').then(m => m.UserRegisterComponent),
  canActivate: [authGuard],
}
,
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./sign-up/sign-up.component').then((m) => m.SignUpComponent),
  },
  {
  path: 'my-events',
  loadComponent: () => import('./my-events/my-events.component').then(m => m.MyEventsComponent)
},
{
  path: 'create-event',
  loadComponent: () => import('./create-event/create-event.component').then(m => m.CreateEventComponent),
  canActivate: [authGuard],
},

{
  path: 'event/deleted',
  loadComponent: () =>
    import('./deleted-events/deleted-events.component').then(m => m.DeletedEventsComponent),
  canActivate: [authGuard],
}
,
{
  path: 'event/:id',
  loadComponent: () => import('./event-details/event-details.component').then(m => m.EventDetailsComponent),
  canActivate: [authGuard],
},
{
  path: 'event/:id/edit',
  loadComponent: () =>
    import('./update-event/update-event.component').then(m => m.EventEditComponent),
  canActivate: [authGuard],
},
{
  path: 'change-username',
  loadComponent: () => import('./change-username/change-username.component').then(m => m.ChangeUsernameComponent),
  canActivate: [authGuard]
},
{
  path: 'change-password',
  loadComponent: () => import('./change-password/change-password.component').then(m => m.ChangePasswordComponent),
  canActivate: [authGuard]
},
{
  path: 'access-denied',
  loadComponent: () =>
    import('./access-denied/access-denied.component').then((m) => m.AccessDeniedComponent),
},

];
