import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';
import './schemas';
import './routes/auth.openapi';
import './routes/user.openapi';
import './routes/project.openapi';
import './routes/company.openapi';
import './routes/task.openapi';

export function generateOpenApiDoc() {
    return new OpenApiGeneratorV3(registry.definitions).generateDocument({
        openapi: '3.0.0',
        info: { title: 'TicketFlow API', version: '1.0.0' },
        servers: [{ url: '/api' }],
    });
}
