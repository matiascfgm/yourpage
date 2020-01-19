import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {countryList} from '../../../enums/countries.enum';
import {AngularFirestore} from '@angular/fire/firestore';
import {User} from '../../../interfaces/user';
import {AuthService} from '../../../core/services/auth.service';
import {debounceTime, map, take} from 'rxjs/operators';
import {DefaultRegex} from '../../../enums/regex.enum';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  countryList: any[] = countryList;
  newUserData: User;
  canSignUp = false;

  personalForm: FormGroup;
  accountForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private afs: AngularFirestore,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.personalForm = new FormGroup({
      name: new FormControl('example', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(15),
        Validators.pattern(DefaultRegex.default),
      ]),
      lastName: new FormControl('lastexample', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(15),
        Validators.pattern(DefaultRegex.default),
      ]),
      gender: new FormControl(Validators.required),
      birthday: new FormControl(Validators.required),
    });

    this.accountForm = new FormGroup({
      userName: new FormControl('usernameexample',
        [Validators.required,
          Validators.minLength(4),
          Validators.maxLength(20),
          Validators.pattern(DefaultRegex.userName)],
        CustomValidator.userName(this.afs),
      ),
      country: new FormControl(Validators.required),
      bio: new FormControl('bio example', [
        Validators.required,
        Validators.maxLength(200)
      ]),
    });
  }

  get name() {
    return this.personalForm.get('name');
  }

  get lastName() {
    return this.personalForm.get('lastName');
  }

  get gender() {
    return this.personalForm.get('gender');
  }

  get birthday() {
    return this.personalForm.get('birthday');
  }

  get userName() {
    return this.accountForm.get('userName');
  }

  get country() {
    return this.accountForm.get('country');
  }

  get bio() {
    return this.accountForm.get('bio');
  }

  saveData() {
    const newUserData: User = {
      personalInfo: {
        userId: null,
        email: null,
        name: this.name.value,
        lastName: this.lastName.value,
        gender: this.gender.value,
        birthday: this.birthday.value
      },
      accountInfo: {
        userName: this.userName.value,
        registrationDate: null,
        imageUrl: null,
        country: this.country.value,
        bio: this.bio.value,
        socialLinks: {
          facebook: null,
          github: null,
          instagram: null,
          linkedin: null,
          twitter: null,
          youtube: null,
        }
      },
      statisticsInfo: {
        followers: 0,
        following: 0,
        posts: 0
      }
    };
    this.newUserData = newUserData;
    this.canSignUp = true;
  }

  signUpWithGoogle() {
    this.authService.googleAuth(this.newUserData);
  }

}

export class CustomValidator {
  static userName(afs: AngularFirestore) {
    return (control: AbstractControl) => {
      const username = control.value.toLowerCase();
      return afs.collection('users', ref => ref.where('accountInfo.userName', '==', username))
        .valueChanges().pipe(
          debounceTime(100), // make sure user stopped writing
          take(1),
          map(arr => arr.length ? {usernameAvailable: false} : null),
        );
    };
  }
}
