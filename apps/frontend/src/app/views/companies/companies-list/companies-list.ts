import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Company, CompanyService } from '../../../services/company.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-companies-list',
  imports: [RouterLink],
  templateUrl: './companies-list.html',
})
export class CompaniesList {
  private companyService = inject(CompanyService);

  companies = signal<Company[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit() {
    try {
      const data = await firstValueFrom(this.companyService.getCompanies());
      this.companies.set(data);
    } catch {
      this.error.set('Companies load failed.');
    } finally {
      this.loading.set(false);
    }
  }
}
