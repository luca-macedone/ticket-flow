import { Routes } from '@angular/router';

import { Home } from './views/home/home';
import { Dashboard } from './views/dashboard/dashboard';
import { roleGuard } from './roleguard.service';
import { NotFoundRedirectComponent } from './views/notfound';
import { ProjectsList } from './views/projects/projects-list/projects-list';
import { ProjectView } from './views/projects/project-view/project-view';
import { Overview } from './views/overview/overview';
import { UserList } from './views/users/user-list/user-list';
import { CompaniesList } from './views/companies/companies-list/companies-list';
import { CompanyView } from './views/companies/company-view/company-view';
import { NewCompany } from './views/companies/new-company/new-company';
import { EditCompany } from './views/companies/edit-company/edit-company';
import { NewProject } from './views/projects/new-project/new-project';
import { EditProject } from './views/projects/edit-project/edit-project';
import { UserView } from './views/users/user-view/user-view';
import { EditUser } from './views/users/edit-user/edit-user';
import { NewUser } from './views/users/new-user/new-user';

export const routes: Routes = [
    {
        path: "",
        component: Home,
    },
    {
        path: "dashboard",
        component: Dashboard,
        canActivate: [roleGuard],
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
                canActivate: [roleGuard],
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
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin', 'agent', 'customer'],
                        },
                    },
                    {
                        path: 'new',
                        component: NewProject,
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin', 'agent', 'customer'],
                            breadcrumb: 'New Project'
                        }
                    },
                    {
                        path: ':id',
                        component: ProjectView,
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin', 'agent', 'customer'],
                            breadcrumb: 'Project Details'
                        }
                    },
                    {
                        path: ':id/edit',
                        component: EditProject,
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin', 'agent', 'customer'],
                            breadcrumb: 'Edit Project'
                        }
                    },
                ],
            },
            {
                path: "companies",
                data: { breadcrumb: 'Companies' },
                children: [
                    {
                        path: "",
                        component: CompaniesList,
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                        },
                    },
                    {
                        path: 'new',
                        component: NewCompany,
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                            breadcrumb: 'New Company'
                        }
                    },
                    {
                        path: ':id',
                        component: CompanyView,
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                            breadcrumb: 'Company'
                        }
                    },
                    {
                        path: ':id/edit',
                        component: EditCompany,
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                            breadcrumb: 'Edit Company'
                        }
                    },
                ],
            },
            {
                path: "users",
                data: { breadcrumb: 'Users' },
                children: [
                    {
                        path: "",
                        component: UserList,
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                        },
                    },
                    {
                        path: 'new',
                        component: NewUser,
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                            breadcrumb: 'New User'
                        }
                    },
                    {
                        path: ':id',
                        component: UserView,
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                            breadcrumb: 'User Details'
                        }
                    },
                    {
                        path: ':id/edit',
                        component: EditUser,
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                            breadcrumb: 'Edit User'
                        }
                    },
                ],
            },
        ]
    },
    {
        path: "**",
        component: NotFoundRedirectComponent,
    },

];
