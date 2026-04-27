import { Routes } from '@angular/router';

import { Home } from './views/home/home';
import { Dashboard } from './views/dashboard/dashboard';
import { RoleGuard } from './roleguard.service';
import { NotFoundRedirectComponent } from './views/notfound';
import { ProjectsList } from './views/projects/projects-list/projects-list';
import { ProjectView } from './views/projects/project-view/project-view';
import { Overview } from './views/overview/overview';
import { UserList } from './views/users/user-list/user-list';
import { CompaniesList } from './views/companies/companies-list/companies-list';

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
            roles: ['admin', 'agent', 'customer'],
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
                canActivate: [RoleGuard],
                data: {
                    breadcrumb: "Overview",
                    roles: ['admin', 'agent', 'customer']
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
                            roles: ['admin', 'agent', 'customer'],
                        },
                    },
                    {
                        path: ':id',
                        component: ProjectView,
                        canActivate: [RoleGuard],
                        data: {
                            roles: ['admin', 'agent', 'customer'],
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
                        component: CompaniesList,
                        canActivate: [RoleGuard],
                        data: {
                            roles: ['admin'],
                        },
                    },
                    {
                        path: ':id',
                        component: ProjectView,
                        canActivate: [RoleGuard],
                        data: {
                            roles: ['admin'],
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
                        component: UserList,
                        canActivate: [RoleGuard],
                        data: {
                            roles: ['admin'],
                        },
                    },
                    // {
                    //     path: ':id',
                    //     component: ProjectView,
                    //     canActivate: [RoleGuard],
                    //     data: {
                    //         roles: ['admin'],
                    //         breadcrumb: 'User'
                    //     }
                    // }
                ],
            },
        ]
    },
    {
        path: "**",
        component: NotFoundRedirectComponent,
    },

];
