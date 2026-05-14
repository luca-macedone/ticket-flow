import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project, ProjectService } from '../../../services/project.service';
import { firstValueFrom } from 'rxjs';
import { DataTable, TableColumn } from '../../../components/tables/ticket-table/data-table';
import { AuthService } from '../../../services/auth.service';

const COLUMNS: TableColumn<Project>[] = [
  { key: 'projectCode', label: 'Code', getValue: (p) => p.projectCode as string, cellClass: 'font-mono text-xs text-text/50', skeletonWidth: 'w-20' },
  { key: 'projectName', label: 'Name', getValue: (p) => p.projectName, cellClass: 'font-medium', skeletonWidth: 'w-36' },
  { key: 'description', label: 'Description', getValue: (p) => p.description ?? '—', cellClass: 'text-text/70', skeletonWidth: 'w-52' },
  { key: 'startDate', label: 'Registered', getValue: (p) => new Date(p.startDate).toLocaleDateString('it-IT'), skeletonWidth: 'w-20' },
];

@Component({
  selector: 'app-projects-list',
  imports: [DataTable],
  templateUrl: './projects-list.html',
})
export class ProjectsList implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);

  private auth = inject(AuthService);
  isAdmin = computed(() => this.auth.user()?.role === 'admin');
  isAgent = computed(() => this.auth.user()?.role === 'agent');


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
    this.router.navigate(['/dashboard/projects', project.projectCode]);
  }

  newProject() {
    this.router.navigate(['/dashboard/projects/new']);
  }
}
