import {Injectable, NgZone} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {DefaultRoutes} from '../../enums/default.routes';
import {switchMap, take} from 'rxjs/operators';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirestoreService} from '../services/firestore.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {

  constructor(
    private router: Router,
    public authService: AuthService,
    private fireAuth: AngularFireAuth,
    public firestoreService: FirestoreService,
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    return this.fireAuth.authState.pipe(
      take(1),
      switchMap(authUser => {
        if (authUser) {
          return this.firestoreService.getUserById(authUser.uid).get().then(res => {
            if (res.data()) {
              this.authService.isSetUp = res.data().accountInfo.userName !== null;
              if (this.authService.isSetUp) {
                // user is set up (VALID USER)
                if (state.url === '/authenticate' || state.url === '/signup' || state.url === '/configure-profile') {
                  this.router.navigate([DefaultRoutes.OnDefault]);
                  return false;
                }
                return true;
              } else {
                // user is NOT set up (INVALID USER)
                if (state.url !== '/configure-profile') {
                  this.router.navigate([DefaultRoutes.OnNotSetup]);
                  return false;
                }
                return true;
              }
            }
          });
        } else if (!authUser) {
          // user is NOT logged in (NEW USER)
          if (state.url === '/profile' || state.url === '/configure-profile') {
            this.router.navigate([DefaultRoutes.OnLoginButtonClick]);
            return false;
          }
          return of(true);
        }
      }));
  }
}
