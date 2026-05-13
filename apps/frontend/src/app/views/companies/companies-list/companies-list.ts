import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Company, CompanyService } from '../../../services/company.service';
import { firstValueFrom } from 'rxjs';
import { DataTable, TableColumn } from '../../../components/tables/ticket-table/data-table';

const COLUMNS: TableColumn<Company>[] = [
  { key: 'companyCode', label: 'Code', getValue: (c) => c.companyCode as string, cellClass: 'font-mono text-xs text-text/50', skeletonWidth: 'w-20' },
  { key: 'companyName', label: 'Name', getValue: (c) => c.companyName, cellClass: 'font-medium', skeletonWidth: 'w-32' },
  { key: 'nationality', label: 'Nationality', getValue: (c) => c.nationality, cellClass: 'text-text/70', skeletonWidth: 'w-24' },
  { key: 'referralEmail', label: 'Email', getValue: (c) => c.referralEmail, cellClass: 'text-text/70', skeletonWidth: 'w-44' },
  { key: 'description', label: 'Description', getValue: (c) => c.description ?? '—', cellClass: 'text-text/50 truncate max-w-xs', skeletonWidth: 'w-48' },
];

@Component({
  selector: 'app-companies-list',
  imports: [DataTable],
  templateUrl: './companies-list.html',
})
export class CompaniesList {
  private companyService = inject(CompanyService);
  private router = inject(Router);

  readonly columns = COLUMNS;
  companies = signal<Company[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit() {
    try {
      this.companies.set(await firstValueFrom(this.companyService.getCompanies()));
    } catch {
      this.error.set('Companies load failed.');
    } finally {
      this.loading.set(false);
    }
  }

  viewCompany(company: Company) {
    this.router.navigate(['/dashboard/companies', company.companyCode]);
  }

  newCompany() {
    this.router.navigate(['/dashboard/companies/new']);
  }
}
