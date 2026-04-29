import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Project, ProjectService } from '../../../services/project.service';
import { DatePipe } from '@angular/common';
import { BaseCard } from "../../../components/overview-cards/base-card/base-card";
import { Company, CompanyService } from '../../../services/company.service';

@Component({
  selector: 'app-project-view',
  imports: [DatePipe, BaseCard],
  templateUrl: './project-view.html',
})
export class ProjectView {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private companyService = inject(CompanyService);

  project = signal<Project | null>(null);
  company = signal<Company | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (!id) return;
      try {
        this.loading.set(true);
        const data: Project = await firstValueFrom(this.projectService.getProjectById(id));
        this.project.set(data);

        const { companyId } = data;
        const companyData: Company = await firstValueFrom(this.companyService.getCompanyById(companyId));
        this.company.set(companyData);
      } catch {
        this.error.set('Progetto non trovato.');
      } finally {
        this.loading.set(false);
      }
    });
  }
}
