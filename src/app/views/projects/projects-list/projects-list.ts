import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Project, ProjectService } from '../../../data/projects.service';

@Component({
  selector: 'app-projects-list',
  imports: [RouterLink],
  templateUrl: './projects-list.html',
})
export class ProjectsList {
  projects: Project[] = []
  constructor(private projectService: ProjectService) {
    this.projects = projectService.getProjects()
  }
}
