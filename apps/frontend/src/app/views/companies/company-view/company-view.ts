import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Company, CompanyService } from '../../../services/company.service';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BaseCard } from "../../../components/overview-cards/base-card/base-card";
import { DataTable, TableColumn } from '../../../components/tables/ticket-table/data-table';
import { AuthService } from '../../../services/auth.service';

type ProjectRow = { id: string; projectName: string; startDate: string; endDate: string | null };

const PROJECT_COLUMNS: TableColumn<ProjectRow>[] = [
  { key: 'projectName', label: 'Name', getValue: (p) => p.projectName, cellClass: 'font-medium' },
  { key: 'startDate', label: 'Start', getValue: (p) => new Date(p.startDate).toLocaleDateString('it-IT') },
  { key: 'endDate', label: 'End', getValue: (p) => p.endDate ? new Date(p.endDate).toLocaleDateString('it-IT') : '—' },
];

@Component({
  selector: 'app-company-view',
  imports: [BaseCard, DataTable],
  templateUrl: './company-view.html',
  styleUrl: './company-view.css',
})
export class CompanyView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);

  company = signal<Company | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly projectColumns = PROJECT_COLUMNS;
  projectPage = signal(1);
  readonly projectPageSize = 5;

  private auth = inject(AuthService);
  isAdmin = computed(() => this.auth.user()?.role === 'admin');
  isAgent = computed(() => this.auth.user()?.role === 'agent');


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

  pagedProjects = computed(() => {
    const list = this.company()?.projects ?? [];
    const start = (this.projectPage() - 1) * this.projectPageSize;
    return list.slice(start, start + this.projectPageSize);
  });

  viewProject(p: ProjectRow) {
    this.router.navigate(['/dashboard/projects/', p.id]);
  }

  editCompany() {
    this.router.navigate(['/dashboard/companies/', this.company()!.id, 'edit']);
  }
}
