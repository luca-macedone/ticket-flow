import { registry } from '../registry';
import { Schemas } from '../schemas';

registry.registerPath({
    method: 'post',
    path: '/auth/login',
    tags: ['Auth'],
    request: {
        body: { content: { 'application/json': { schema: Schemas.Login } } },
    },
    responses: {
        200: { description: 'Access token', content: { 'application/json': { schema: Schemas.LoginResponse } } },
        401: { description: 'Invalid credentials' },
        403: { description: 'User not approved' },
    },
});
