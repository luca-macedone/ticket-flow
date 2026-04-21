import { registry } from '../registry';
import { Schemas, IdParamSchema, PaginationQuerySchema } from '../schemas';

const auth = [{ BearerAuth: [] }];

registry.registerPath({
    method: 'get', path: '/companies', tags: ['Companies'], security: auth,
    request: { query: PaginationQuerySchema },
    responses: {
        200: { description: 'Companies list', content: { 'application/json': { schema: Schemas.CompanyResponse.array() } } },
        401: { description: 'Unauthorized' },
    },
});

registry.registerPath({
    method: 'get', path: '/companies/{id}', tags: ['Companies'], security: auth,
    request: { params: IdParamSchema },
    responses: {
        200: { description: 'Company', content: { 'application/json': { schema: Schemas.CompanyResponse } } },
        404: { description: 'Not found' },
    },
});

registry.registerPath({
    method: 'post', path: '/companies', tags: ['Companies'], security: auth,
    request: { body: { content: { 'application/json': { schema: Schemas.CreateCompany } } } },
    responses: {
        201: { description: 'Created', content: { 'application/json': { schema: Schemas.CompanyResponse } } },
        400: { description: 'Validation error' },
        403: { description: 'Forbidden' },
    },
});

registry.registerPath({
    method: 'patch', path: '/companies/{id}', tags: ['Companies'], security: auth,
    request: {
        params: IdParamSchema,
        body: { content: { 'application/json': { schema: Schemas.UpdateCompany } } },
    },
    responses: {
        200: { description: 'Updated', content: { 'application/json': { schema: Schemas.CompanyResponse } } },
        403: { description: 'Forbidden' },
        404: { description: 'Not found' },
    },
});

registry.registerPath({
    method: 'delete', path: '/companies/{id}', tags: ['Companies'], security: auth,
    request: { params: IdParamSchema },
    responses: {
        204: { description: 'Deleted' },
        403: { description: 'Forbidden' },
    },
});
