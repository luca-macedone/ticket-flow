import { RoleEnum } from '@packages/shared';
import { SelectOption } from '../../components/fields/select-field/select-field';

const ROLE_LABEL: Record<string, string> = {
    ADMIN: 'Admin',
    AGENT: 'Agent',
    CUSTOMER: 'Customer',
};

export const ROLE_OPTIONS: SelectOption[] = RoleEnum.options.map(v => ({
    value: v,
    label: ROLE_LABEL[v] ?? v,
}));
