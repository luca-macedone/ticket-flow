
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
    getUserId() {
        const id = sessionStorage.getItem('userId');
        return id;
    }

    getUserRole() {
        return sessionStorage.getItem("userRole");
    }

    isLoggedIn(): boolean {
        return sessionStorage.getItem("accessToken") != null;
    }
}
