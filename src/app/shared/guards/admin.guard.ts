import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { StateService } from '../services/state.service';
import { Role } from '../enums/role.enum';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return StateService.getUser()?.role === Role.admin;
    }
}
