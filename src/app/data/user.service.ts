
import { Injectable } from '@angular/core';
import { DEFAULT_USERS } from '../data/users.data';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    getUsers() {
        return DEFAULT_USERS;
    }

    getUserId() {
        const id = sessionStorage.getItem('userId');
        console.log('id retrived', id)
        return id;
    }

    getUserRole() {
        const id = sessionStorage.getItem('userId');
        const role = DEFAULT_USERS.find(x => x.id === Number(id))?.role;
        console.log(`id: ${id}, role ${role}`)
        return role;
    }

    isLoggedIn(): boolean {
        return this.getUserId() !== null;
    }

}
