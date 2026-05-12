
import { FormGroup } from '@angular/forms';
import { ZodType } from 'zod';

export function mapZodErrors(schema: ZodType, form: FormGroup): Record<string, string[]> {
    const result = schema.safeParse(form.getRawValue());
    if (result.success) return {};
    const errors: Record<string, string[]> = {};
    for (const e of result.error.issues) {
        const key = (e.path[0] as string) ?? 'api';
        errors[key] = [...(errors[key] ?? []), e.message];
    }
    return errors;
}
