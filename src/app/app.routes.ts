import { Routes } from '@angular/router';

import { Home } from './views/home/home';
import { Dashboard } from './views/dashboard/dashboard';
import { RoleGuard } from './roleguard.service';
import { Backoffice } from './views/backoffice/backoffice';
import { NotFoundRedirectComponent } from './views/notfound';
import { ProjectsList } from './views/projects/projects-list/projects-list';
import { ProjectView } from './views/projects/project-view/project-view';

export const routes: Routes = [
    {
        path: "",
        component: Home,
    },
    {
        path: "dashboard",
        component: Dashboard,
        canActivate: [RoleGuard],
        data: {
            roles: ['admin', 'user'],
            breadcrumb: 'Dashboard'
        },
        children: [
            {
                path: "",
                component: ProjectsList,
                canActivate: [RoleGuard],
                data: {
                    roles: ['admin', 'user'],
                    breadcrumb: 'Projects'
                }
            },
            {
                path: ":id",
                component: ProjectView,
                canActivate: [RoleGuard],
                data: {
                    roles: ['admin', 'user']
                }
            },

        ]
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
