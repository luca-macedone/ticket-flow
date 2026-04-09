import { Routes } from '@angular/router';

import { Home } from './views/home/home';
import { Dashboard } from './views/dashboard/dashboard';
import { RoleGuard } from './roleguard.service';
import { Backoffice } from './views/backoffice/backoffice';
import { NotFoundRedirectComponent } from './views/notfound';

export const routes: Routes = [
    {
        path: "",
        component: Home,
    },
    {
        path: "dashboard",
        component: Dashboard,
        canActivate: [RoleGuard],
        data: { roles: ['user', 'admin'] }
    },
    {
        path: "backoffice",
        component: Backoffice,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
    },
    {
        path: "**",
        component: NotFoundRedirectComponent,
    },

];
