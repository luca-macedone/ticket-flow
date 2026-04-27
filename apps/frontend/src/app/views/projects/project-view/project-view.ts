import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Project, ProjectService } from '../../../services/project.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-view',
  imports: [DatePipe],
  templateUrl: './project-view.html',
})
export class ProjectView {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);

  project = signal<Project | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (!id) return;
      try {
        this.loading.set(true);
        const data = await firstValueFrom(this.projectService.getProjectById(id));
        this.project.set(data);
      } catch {
        this.error.set('Progetto non trovato.');
      } finally {
        this.loading.set(false);
      }
    });
  }
}
