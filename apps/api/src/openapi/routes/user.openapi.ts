import { registry } from '../registry';
import { Schemas, IdParamSchema, PaginationQuerySchema } from '../schemas';

registry.registerPath({
    method: 'post',
    path: '/users/register',
    tags: ['Users'],
    request: {
        body: { content: { 'application/json': { schema: Schemas.CreateUser } } },
    },
    responses: {
        201: { description: 'Registered — awaiting approval' },
        400: { description: 'Validation error' },
    },
});

registry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['Users'],
    security: [{ BearerAuth: [] }],
    request: { query: PaginationQuerySchema },
    responses: {
        200: { description: 'Users list', content: { 'application/json': { schema: Schemas.UserResponse.array() } } },
        401: { description: 'Unauthorized' },
    },
});

registry.registerPath({
    method: 'get',
    path: '/users/me',
    tags: ['Users'],
    security: [{ BearerAuth: [] }],
    responses: {
        200: { description: 'Current user', content: { 'application/json': { schema: Schemas.UserResponse } } },
        401: { description: 'Unauthorized' },
    },
});

registry.registerPath({
    method: 'get',
    path: '/users/{id}',
    tags: ['Users'],
    security: [{ BearerAuth: [] }],
    request: { params: IdParamSchema },
    responses: {
        200: { description: 'User', content: { 'application/json': { schema: Schemas.UserResponse } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Not found' },
    },
});

registry.registerPath({
    method: 'post',
    path: '/users',
    tags: ['Users'],
    security: [{ BearerAuth: [] }],
    request: {
        body: { content: { 'application/json': { schema: Schemas.CreateUser } } },
    },
    responses: {
        201: { description: 'User created' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/users/{id}',
    tags: ['Users'],
    security: [{ BearerAuth: [] }],
    request: {
        params: IdParamSchema,
        body: { content: { 'application/json': { schema: Schemas.UpdateUser } } },
    },
    responses: {
        200: { description: 'Updated', content: { 'application/json': { schema: Schemas.UserResponse } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/users/{id}',
    tags: ['Users'],
    security: [{ BearerAuth: [] }],
    request: { params: IdParamSchema },
    responses: {
        204: { description: 'Deleted' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/admin/users/{id}/approve',
    tags: ['Admin'],
    security: [{ BearerAuth: [] }],
    request: { params: IdParamSchema },
    responses: {
        200: { description: 'User approved' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
    },
});
