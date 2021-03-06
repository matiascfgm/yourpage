import {Component, OnInit, Input} from '@angular/core';
import {User} from '../../../class/user';
import {AppComponent} from '../../../app.component';
import {AuthService} from '../../services/auth.service';
import {DefaultRoutes} from '../../../enums/default.routes';
import {Location} from '../../../class/location';
import {Router} from '@angular/router';
import {ApiService} from '../../services/api.service';
import {ApiResponse} from '../../../interfaces/api-response';
import {MatSnackBar} from '@angular/material';
import {MapsService} from '../../services/maps.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent implements OnInit {
  public age: number = null;
  public country: string;
  public loading = false;

  @Input() userData: User;
  @Input() isUserProfile: boolean;

  constructor(public appComponent: AppComponent,
              public authService: AuthService,
              private router: Router,
              private apiService: ApiService,
              private snackBar: MatSnackBar,
              private mapsService: MapsService) {
  }

  ngOnInit() {
    this.getCountry();
    this.getAge();
  }

  public getAge() {
    // @ts-ignore
    const timeDiff = Math.abs(Date.now() - new Date(this.userData.personalInfo.birthday.toDate()).getTime());
    this.age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
  }

  public getCountry() {
    this.mapsService.findLocation(this.userData.accountInfo.placeId).then((res: Location) => {
      this.country = res.country;
    }).catch((e) => {
      console.error(e);
    });
  }

  public toggleFollow(action: string) {
    if (!this.authService.isLoggedIn) { // not logged in cannot follow
      this.router.navigate([DefaultRoutes.OnLoginButtonClick]);
      return;
    }
    this.loading = true;
    this.apiService.toggleFollow(this.userData.personalInfo.userId, action).subscribe((r: ApiResponse) => {
      this.loading = false;
      if (!r.success) {
        this.snackBar.open(r.message, 'dismiss', {
          duration: 4000,
        });
      }
    });
  }

  public isFollowing() {
    for (const following of this.authService.user$.getValue().following) {
      if (following === this.userData.personalInfo.userId) {
        return true;
      }
    }
    return false;
  }
}
