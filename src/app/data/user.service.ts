
import { Injectable } from '@angular/core';
import { DEFAULT_USERS } from '../data/users.data';

export interface User {
    id: number,
    name: string,
    role: "guest" | "user" | "admin"
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    getUsers() {
        return DEFAULT_USERS;
    }

    getUserId() {
        const id = sessionStorage.getItem('userId');
        return id;
    }

    getUserRole() {
        const id = sessionStorage.getItem('userId');
        const role = DEFAULT_USERS.find(x => x.id === Number(id))?.role;
        return role;
    }

    isLoggedIn(): boolean {
        return this.getUserId() !== null;
    }

    getUserName() {
        const id = sessionStorage.getItem('userId');
        const name = DEFAULT_USERS.find(x => x.id === Number(id))?.name;
        return name;
    }
}
