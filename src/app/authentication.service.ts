import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Authentication } from './authentication';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
    
    private apiUri = 'https://mean-shop-example-api.herokuapp.com/api/';

    constructor(private http: HttpClient) {}
    
    login(email: string, password: string): Observable<Authentication> {
        return this.http.post<Authentication>(this.apiUri + 'login/', {
            email: email,
            password: password
        });
    }
    
    register(name: string, email: string, password: string): Observable<Authentication> {
        return this.http.post<Authentication>(this.apiUri + 'register/', {
            name: name,
            email: email,
            password: password
        });
    }
}
