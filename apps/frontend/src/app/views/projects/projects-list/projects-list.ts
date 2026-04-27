import { Component, inject, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Project, ProjectService } from '../../../services/project.service';
import { firstValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-projects-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './projects-list.html',
})
export class ProjectsList {
  private projectService = inject(ProjectService);

  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit() {
    try {
      const data = await firstValueFrom(this.projectService.getProjects())
      this.projects.set(data);
    } catch {
      this.error.set("Project load failed.");
    } finally {
      this.loading.set(false)
    }
  }
}
