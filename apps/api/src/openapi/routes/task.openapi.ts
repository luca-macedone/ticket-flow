import { registry } from '../registry';
import { Schemas, IdParamSchema, PaginationQuerySchema } from '../schemas';

const auth = [{ BearerAuth: [] }];

registry.registerPath({
    method: 'get', path: '/tasks', tags: ['Tasks'], security: auth,
    request: { query: PaginationQuerySchema },
    responses: {
        200: { description: 'Tasks list', content: { 'application/json': { schema: Schemas.TaskResponse.array() } } },
        401: { description: 'Unauthorized' },
    },
});

registry.registerPath({
    method: 'get', path: '/tasks/{id}', tags: ['Tasks'], security: auth,
    request: { params: IdParamSchema },
    responses: {
        200: { description: 'Task', content: { 'application/json': { schema: Schemas.TaskResponse } } },
        404: { description: 'Not found' },
    },
});

registry.registerPath({
    method: 'post', path: '/tasks', tags: ['Tasks'], security: auth,
    request: { body: { content: { 'application/json': { schema: Schemas.CreateTask } } } },
    responses: {
        201: { description: 'Created', content: { 'application/json': { schema: Schemas.TaskResponse } } },
        400: { description: 'Validation error' },
    },
});

registry.registerPath({
    method: 'patch', path: '/tasks/{id}', tags: ['Tasks'], security: auth,
    request: {
        params: IdParamSchema,
        body: { content: { 'application/json': { schema: Schemas.UpdateTask } } },
    },
    responses: {
        200: { description: 'Updated', content: { 'application/json': { schema: Schemas.TaskResponse } } },
        404: { description: 'Not found' },
    },
});

registry.registerPath({
    method: 'delete', path: '/tasks/{id}', tags: ['Tasks'], security: auth,
    request: { params: IdParamSchema },
    responses: {
        204: { description: 'Deleted' },
        403: { description: 'Forbidden — ADMIN only' },
    },
});
