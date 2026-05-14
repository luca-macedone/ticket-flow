import { Routes } from '@angular/router';
import { roleGuard } from './roleguard.service';
import { Overview } from './views/overview/overview';
import { Dashboard } from './views/dashboard/dashboard';
import { Home } from './views/home/home';

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
                path: "backoffice",
                canActivate: [roleGuard],
                data: {
                    breadcrumb: "Backoffice",
                    roles: ['admin']
                },
                loadComponent: () => import('./views/backoffice/backoffice').then(m => m.Backoffice)
            },
            {
                path: "tickets",
                data: { breadcrumb: 'Tickets' },
                children: [
                    {
                        path: "",
                        loadComponent: () => import('./views/tickets/tickets-list/tickets-list').then(m => m.TicketsList),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin', 'agent', 'customer'],
                            breadcrumb: 'Tickets'
                        },
                    },
                    {
                        path: 'new',
                        loadComponent: () => import('./views/tickets/new-ticket/new-ticket').then(m => m.NewTicket),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin', 'agent', 'customer'],
                            breadcrumb: 'New Ticket'
                        }
                    },
                    {
                        path: ':code',
                        loadComponent: () => import('./views/tickets/ticket-view/ticket-view').then(m => m.TicketView),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin', 'agent', 'customer'],
                            breadcrumb: 'Ticket Details'
                        }
                    },
                    {
                        path: ':code/edit',
                        loadComponent: () => import('./views/tickets/edit-ticket/edit-ticket').then(m => m.EditTicket),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin', 'agent', 'customer'],
                            breadcrumb: 'Edit Ticket'
                        }
                    },
                ]
            },
            {
                path: "projects",
                data: { breadcrumb: 'Projects' },
                children: [
                    {
                        path: "",
                        loadComponent: () => import('./views/projects/projects-list/projects-list').then(m => m.ProjectsList),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin', 'agent', 'customer'],
                        },
                    },
                    {
                        path: 'new',
                        loadComponent: () => import('./views/projects/new-project/new-project').then(m => m.NewProject),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin', 'agent', 'customer'],
                            breadcrumb: 'New Project'
                        }
                    },
                    {
                        path: ':code',
                        loadComponent: () => import('./views/projects/project-view/project-view').then(m => m.ProjectView),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin', 'agent', 'customer'],
                            breadcrumb: 'Project Details'
                        }
                    },
                    {
                        path: ':code/edit',
                        loadComponent: () => import('./views/projects/edit-project/edit-project').then(m => m.EditProject),
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
                        loadComponent: () => import('./views/companies/companies-list/companies-list').then(m => m.CompaniesList),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                        },
                    },
                    {
                        path: 'new',
                        loadComponent: () => import('./views/companies/new-company/new-company').then(m => m.NewCompany),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                            breadcrumb: 'New Company'
                        }
                    },
                    {
                        path: ':code',
                        loadComponent: () => import('./views/companies/company-view/company-view').then(m => m.CompanyView),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                            breadcrumb: 'Company'
                        }
                    },
                    {
                        path: ':code/edit',
                        loadComponent: () => import('./views/companies/edit-company/edit-company').then(m => m.EditCompany),
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
                        loadComponent: () => import('./views/users/user-list/user-list').then(m => m.UserList),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                        },
                    },
                    {
                        path: 'new',
                        loadComponent: () => import('./views/users/new-user/new-user').then(m => m.NewUser),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                            breadcrumb: 'New User'
                        }
                    },
                    {
                        path: ':code',
                        loadComponent: () => import('./views/users/user-view/user-view').then(m => m.UserView),
                        canActivate: [roleGuard],
                        data: {
                            roles: ['admin'],
                            breadcrumb: 'User Details'
                        }
                    },
                    {
                        path: ':code/edit',
                        loadComponent: () => import('./views/users/edit-user/edit-user').then(m => m.EditUser),
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
        loadComponent: () => import('./views/notfound').then(m => m.NotFoundRedirectComponent),
    },

];
