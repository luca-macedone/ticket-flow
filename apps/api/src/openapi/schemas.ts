import { registry } from './registry';

import {
    CreateUserSchema, UpdateUserSchema, UserResponseSchema,
    CreateProjectSchema, UpdateProjectSchema, ProjectResponseSchema,
    CreateTaskSchema, UpdateTaskSchema, TaskResponseSchema,
    CreateCompanySchema, UpdateCompanySchema, CompanyResponseSchema,
    LoginSchema, LoginResponseSchema,
    IdParamSchema, PaginationQuerySchema
} from '@packages/shared';

export const Schemas = {
    CreateUser: registry.register('CreateUser', CreateUserSchema),
    UpdateUser: registry.register('UpdateUser', UpdateUserSchema),
    UserResponse: registry.register('UserResponse', UserResponseSchema),
    CreateProject: registry.register('CreateProject', CreateProjectSchema),
    UpdateProject: registry.register('UpdateProject', UpdateProjectSchema),
    ProjectResponse: registry.register('ProjectResponse', ProjectResponseSchema),
    CreateTask: registry.register('CreateTask', CreateTaskSchema),
    UpdateTask: registry.register('UpdateTask', UpdateTaskSchema),
    TaskResponse: registry.register('TaskResponse', TaskResponseSchema),
    CreateCompany: registry.register('CreateCompany', CreateCompanySchema),
    UpdateCompany: registry.register('UpdateCompany', UpdateCompanySchema),
    CompanyResponse: registry.register('CompanyResponse', CompanyResponseSchema),
    Login: registry.register('Login', LoginSchema),
    LoginResponse: registry.register('LoginResponse', LoginResponseSchema),
};

// Security scheme Bearer JWT
registry.registerComponent('securitySchemes', 'BearerAuth', {
    type: 'http', scheme: 'bearer', bearerFormat: 'JWT',
});

export { IdParamSchema, PaginationQuerySchema };