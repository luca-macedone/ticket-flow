import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project, ProjectService } from '../../../data/projects.service';

@Component({
  selector: 'app-project-view',
  imports: [],
  templateUrl: './project-view.html',
  styleUrl: './project-view.css',
})
export class ProjectView {
  projectId = signal(-1);
  project = signal(null as Project | null);

  constructor(private route: ActivatedRoute, private projectService: ProjectService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      this.projectId.set(Number(id))
      const project = this.projectService.getProjectById(Number(id))

      this.project.set(project)
    })
  }
}
