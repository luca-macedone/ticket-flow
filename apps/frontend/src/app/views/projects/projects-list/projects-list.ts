import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Project, ProjectService } from '../../../services/project.service';
import { firstValueFrom } from 'rxjs';
import { DataTable, TableColumn } from '../../../components/tables/ticket-table/data-table';

const COLUMNS: TableColumn<Project>[] = [
  { key: 'projectName', label: 'Name', getValue: (p) => p.projectName, cellClass: 'font-medium' },
  { key: 'description', label: 'Description', getValue: (p) => p.description ?? '—', cellClass: 'text-text/70' },
  { key: 'startDate', label: 'Registered', getValue: (p) => new Date(p.startDate).toLocaleDateString('it-IT') },
];

@Component({
  selector: 'app-projects-list',
  imports: [DataTable],
  templateUrl: './projects-list.html',
})
export class ProjectsList {
  private projectService = inject(ProjectService);
  private router = inject(Router);

  readonly columns = COLUMNS;
  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit() {
    try {
      this.projects.set(await firstValueFrom(this.projectService.getProjects()));
    } catch {
      this.error.set('Project load failed.');
    } finally {
      this.loading.set(false);
    }
  }

  viewProject(project: Project) {
    this.router.navigate(['/dashboard/projects', project.id]);
  }

  newProject() {
    this.router.navigate(['/dashboard/projects/new']);
  }
}
