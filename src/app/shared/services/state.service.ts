import { Injectable } from '@angular/core';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class StateService {

    constructor() {}

    static isAuth(): boolean {
        return !!sessionStorage.token;
    }

    static getUser(): User | undefined {
        const base64 = sessionStorage.token?.split('.')[1];
        return base64 ? JSON.parse(decodeURIComponent(escape(atob(base64)))) : undefined;
    }
}
