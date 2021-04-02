import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Router } from '@angular/router';
import { AngularFireDatabase } from 'angularfire2/database';
import { User } from '../store/user/user.model';
import { AppState } from '../store/app.state';
import { Store } from '@ngrx/store';
import { UserActions } from '../store/user/user.actions';
import { getExpenses, getUserBudget, getBudgetCategories } from '../store/budget/budget.actions';
import { budgetStateSelectors } from '../store/budget/budget.selector';
import { BudgetCategory } from '../store/budget/budget.model';
import { FirebaseService } from './firebase.service';

@Injectable()
export class AuthService {
  public user_data: User;
  constructor(private Store: Store<AppState>, private AngularFireAuth: AngularFireAuth, private Router: Router, private AngularFireDatabase: AngularFireDatabase, private FirebaseService: FirebaseService) {}

  autoLoginUser() {
    this.AngularFireAuth.auth.signInAnonymously().then((anon_user: auth.UserCredential) => {

      const user: User = {
        email: anon_user.user.email,
        user_id: anon_user.user.uid
      }

      this.Store.dispatch(UserActions.receiveUserDetails({user}));
      this.Store.dispatch(new getExpenses());
      this.Store.dispatch(new getUserBudget());
      this.Store.dispatch(new getBudgetCategories());
    })
    .catch((error) => console.log(error));

    // this.AngularFireAuth.user.subscribe((user: firebase.User) => {
    //   if (user) {
    //     this.user_data = {email: user.email, user_id: user.uid}
    //     this.Store.dispatch(UserActions.receiveUserDetails({user: this.user_data}));
    //     this.Store.dispatch(new getExpenses());
    //     this.Store.dispatch(new getUserBudget());
    //     this.Store.dispatch(new getBudgetCategories());
    //   }
    // });
  }

  async login(email: string, password: string) {
    // set to local for easy access purposes, might change later
    this.AngularFireAuth.auth.setPersistence('local')
    .then(() => this.AngularFireAuth.auth.signInWithEmailAndPassword(email, password))
    .then((user_data: auth.UserCredential) => {

      const user: User = {
        email: user_data.user.email,
        user_id: user_data.user.uid
      }

      this.Store.dispatch(UserActions.receiveUserDetails({user}));
      this.Store.dispatch(new getExpenses());
      this.Store.dispatch(new getUserBudget());
      this.Store.dispatch(new getBudgetCategories());
    })
    .catch((error) => console.log(error));
  }

  async register(email: string, password: string, budget_categories: BudgetCategory[]) {
    try {
      await this.AngularFireAuth.auth.createUserWithEmailAndPassword(email, password).then((user_data: auth.UserCredential) => {
        this.AngularFireDatabase.database.ref(`users/${user_data.user.uid}`).set({
          uid: user_data.user.uid,
          email: user_data.user.email,
        });

        const user: User = {
          email: user_data.user.email,
          user_id: user_data.user.uid
        }

        this.Store.dispatch( UserActions.receiveUserDetails({user}));
      });

      //store data in database
    } catch (error) {
      console.log(error);
    }

    // this.sendEmailVerification();
  }

  async sendEmailVerification() {
    await this.AngularFireAuth.auth.currentUser.sendEmailVerification();
  }

  async sendPasswordResetEmail(passwordResetEmail: string) {
    return await this.AngularFireAuth.auth.sendPasswordResetEmail(passwordResetEmail);
  }

  async signOut() {
    await this.AngularFireAuth.auth.signOut();
    this.Router.navigate(['/']);
  }
}