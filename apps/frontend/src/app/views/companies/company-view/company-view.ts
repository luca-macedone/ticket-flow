import { Component, inject, signal } from '@angular/core';
import { Company, CompanyService } from '../../../services/company.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BaseCard } from "../../../components/overview-cards/base-card/base-card";

@Component({
  selector: 'app-company-view',
  imports: [BaseCard],
  templateUrl: './company-view.html',
  styleUrl: './company-view.css',
})
export class CompanyView {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);

  company = signal<Company | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      try {
        this.loading.set(true);
        const data = await firstValueFrom(this.companyService.getCompanyById(id!));
        this.company.set(data);

      } catch (error) {
        this.error.set('Company not found.');
      } finally {
        this.loading.set(false);
      }
    });
  }
}
