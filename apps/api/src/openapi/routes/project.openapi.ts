import { registry } from '../registry';
import { Schemas, IdParamSchema, PaginationQuerySchema } from '../schemas';

const auth = [{ BearerAuth: [] }];

registry.registerPath({
    method: 'get', path: '/projects', tags: ['Projects'], security: auth,
    request: { query: PaginationQuerySchema },
    responses: {
        200: { description: 'Projects list', content: { 'application/json': { schema: Schemas.ProjectResponse.array() } } },
        401: { description: 'Unauthorized' },
    },
});

registry.registerPath({
    method: 'get', path: '/projects/{id}', tags: ['Projects'], security: auth,
    request: { params: IdParamSchema },
    responses: {
        200: { description: 'Project', content: { 'application/json': { schema: Schemas.ProjectResponse } } },
        401: { description: 'Unauthorized' },
        404: { description: 'Not found' },
    },
});

registry.registerPath({
    method: 'post', path: '/projects', tags: ['Projects'], security: auth,
    request: { body: { content: { 'application/json': { schema: Schemas.CreateProject } } } },
    responses: {
        201: { description: 'Created', content: { 'application/json': { schema: Schemas.ProjectResponse } } },
        400: { description: 'Validation error' },
        403: { description: 'Forbidden' },
    },
});

registry.registerPath({
    method: 'patch', path: '/projects/{id}', tags: ['Projects'], security: auth,
    request: {
        params: IdParamSchema,
        body: { content: { 'application/json': { schema: Schemas.UpdateProject } } },
    },
    responses: {
        200: { description: 'Updated', content: { 'application/json': { schema: Schemas.ProjectResponse } } },
        403: { description: 'Forbidden' },
        404: { description: 'Not found' },
    },
});

registry.registerPath({
    method: 'delete', path: '/projects/{id}', tags: ['Projects'], security: auth,
    request: { params: IdParamSchema },
    responses: {
        204: { description: 'Deleted' },
        403: { description: 'Forbidden' },
        404: { description: 'Not found' },
    },
});
