import { AbstractControl } from "@angular/forms";

export function dateRangeValidator(group: AbstractControl) {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    return start && end && start > end ? { dateRange: true } : null;
}