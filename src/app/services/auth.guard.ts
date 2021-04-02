import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { tap, map, take, takeUntil } from 'rxjs/operators';
import { AppState } from '../store/app.state';
import { UserSelectors } from '../store/user/user.selectors';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private user_logged_in: boolean;
  private destroy$ = new Subject<void>();

  constructor(private AuthService: AuthService, private Router: Router, private Store: Store<AppState>) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.Store.select(UserSelectors.isUserLoggedIn)
    .pipe(map((user_loggged_in: boolean) => {
      if (!user_loggged_in) {
        this.Router.navigate(['home']);
      }

      return user_loggged_in;
    }))
  }
}
