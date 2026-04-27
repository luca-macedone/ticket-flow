import { Routes } from '@angular/router';

import { Home } from './views/home/home';
import { Dashboard } from './views/dashboard/dashboard';
import { RoleGuard } from './roleguard.service';
import { Backoffice } from './views/backoffice/backoffice';
import { NotFoundRedirectComponent } from './views/notfound';
import { ProjectsList } from './views/projects/projects-list/projects-list';
import { ProjectView } from './views/projects/project-view/project-view';
import { Overview } from './views/overview/overview';

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
                redirectTo: "overview",
                pathMatch: "full"
            },
            {
                path: "overview",
                data: {
                    breadcrumb: "Overview",
                },
                component: Overview
            },
            {
                path: "projects",
                data: { breadcrumb: 'Projects' },
                children: [
                    {
                        path: "",
                        component: ProjectsList,
                        canActivate: [RoleGuard],
                        data: {
                            roles: ['admin', 'user'],
                        },
                    },
                    {
                        path: ':id',
                        component: ProjectView,
                        canActivate: [RoleGuard],
                        data: {
                            roles: ['admin', 'user'],
                            breadcrumb: 'Project'
                        }
                    }
                ],
            },
            {
                path: "companies",
                data: { breadcrumb: 'Companies' },
                children: [
                    {
                        path: "",
                        component: ProjectsList,
                        canActivate: [RoleGuard],
                        data: {
                            roles: ['admin', 'user'],
                        },
                    },
                    {
                        path: ':id',
                        component: ProjectView,
                        canActivate: [RoleGuard],
                        data: {
                            roles: ['admin', 'user'],
                            breadcrumb: 'Company'
                        }
                    }
                ],
            },
            {
                path: "users",
                data: { breadcrumb: 'Users' },
                children: [
                    {
                        path: "",
                        component: ProjectsList,
                        canActivate: [RoleGuard],
                        data: {
                            roles: ['admin', 'user'],
                        },
                    },
                    {
                        path: ':id',
                        component: ProjectView,
                        canActivate: [RoleGuard],
                        data: {
                            roles: ['admin', 'user'],
                            breadcrumb: 'User'
                        }
                    }
                ],
            },
        ]
    },
    {
        path: "**",
        component: NotFoundRedirectComponent,
    },

];
