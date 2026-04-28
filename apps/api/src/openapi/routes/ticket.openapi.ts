import { registry } from '../registry';
import { Schemas, IdParamSchema, PaginationQuerySchema } from '../schemas';

const auth = [{ BearerAuth: [] }];

registry.registerPath({
    method: 'get', path: '/tickets', tags: ['Tickets'], security: auth,
    request: { query: PaginationQuerySchema },
    responses: {
        200: { description: 'Tickets list', content: { 'application/json': { schema: Schemas.TicketResponse.array() } } },
        401: { description: 'Unauthorized' },
    },
});

registry.registerPath({
    method: 'get', path: '/tickets/{id}', tags: ['Tickets'], security: auth,
    request: { params: IdParamSchema },
    responses: {
        200: { description: 'Ticket', content: { 'application/json': { schema: Schemas.TicketResponse } } },
        404: { description: 'Not found' },
    },
});

registry.registerPath({
    method: 'post', path: '/tickets', tags: ['Tickets'], security: auth,
    request: { body: { content: { 'application/json': { schema: Schemas.CreateTicket } } } },
    responses: {
        201: { description: 'Created', content: { 'application/json': { schema: Schemas.TicketResponse } } },
        400: { description: 'Validation error' },
    },
});

registry.registerPath({
    method: 'patch', path: '/tickets/{id}', tags: ['Tickets'], security: auth,
    request: {
        params: IdParamSchema,
        body: { content: { 'application/json': { schema: Schemas.UpdateTicket } } },
    },
    responses: {
        200: { description: 'Updated', content: { 'application/json': { schema: Schemas.TicketResponse } } },
        404: { description: 'Not found' },
    },
});

registry.registerPath({
    method: 'delete', path: '/tickets/{id}', tags: ['Tickets'], security: auth,
    request: { params: IdParamSchema },
    responses: {
        204: { description: 'Deleted' },
        403: { description: 'Forbidden — ADMIN only' },
    },
});
