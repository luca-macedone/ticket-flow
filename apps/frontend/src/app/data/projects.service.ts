import { Injectable } from "@angular/core";
import { DEFAULT_PROJECTS } from "./projects.data";

export interface Project {
    id: number,
    name: string,
    isVisibile: boolean,
    description: string,
    tasks: any[]
}

@Injectable({
    providedIn: 'root'
})
export class ProjectService {

    getProjects() {
        return DEFAULT_PROJECTS;
    }

    getProjectById(_id: number) {
        return DEFAULT_PROJECTS.find(x => x.id === _id) ?? null;
    }

    isVisible(_id: number) {
        return this.getProjectById(_id)?.isVisibile ?? false;
    }
}