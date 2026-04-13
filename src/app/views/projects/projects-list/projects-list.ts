import { Component } from '@angular/core';

@Component({
  selector: 'app-projects-list',
  imports: [],
  templateUrl: './projects-list.html',
})
export class ProjectsList {
  defaultProjects = [
    {
      id: 0,
      name: 'alten',
      isVisibile: true,
      description: "lorem ipsum",
      tasks: []
    },
    {
      id: 1,
      name: 'abb',
      isVisibile: true,
      description: "lorem ipsum",
      tasks: []
    },
    {
      id: 2,
      name: 'siemens',
      isVisibile: true,
      description: "lorem ipsum",
      tasks: []
    },
    {
      id: 3,
      name: 'friem',
      isVisibile: false,
      description: "lorem ipsum",
      tasks: []
    },
    {
      id: 4,
      name: 'ferrari',
      isVisibile: true,
      description: "lorem ipsum",
      tasks: []
    },
    {
      id: 5,
      name: 'hitachi',
      isVisibile: false,
      description: "lorem ipsum",
      tasks: []
    },
  ]
}
