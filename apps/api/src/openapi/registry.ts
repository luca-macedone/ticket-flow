import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from '@packages/shared';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';


extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();
