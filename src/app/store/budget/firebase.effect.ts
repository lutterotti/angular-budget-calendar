import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { FirebaseService } from '../../services/firebase.service';
import { of as observableOf } from 'rxjs';
import { AppState } from '../app.state';
import { UserSelectors } from '../user/user.selectors';
import { BudgetActionTypes, getBudgetCategoriesFailed, getBudgetCategoriesSucceeded, getExpensesFailed, getExpensesSucceeded, getUserBudgetFailed, getUserBudgetSucceeded } from './budget.actions';
import { FirebaseExpense, UserBudget } from './budget.model';

@Injectable()
export class FirebaseEffects {

  constructor(private Actions: Actions, private Store: Store<AppState>, private FirebaseService: FirebaseService) {}

  @Effect()
  retrieveExpenses = this.Actions
    .pipe(ofType(BudgetActionTypes.getExpenses))
    .pipe(withLatestFrom(this.Store.select(UserSelectors.getUserId)))
    .pipe(switchMap(([_, user_id]: [any, string]) => this.FirebaseService.getExpenses(user_id)
    .pipe(map((expenses: FirebaseExpense[]) => new getExpensesSucceeded(expenses)), catchError((err: any) => observableOf(new getExpensesFailed())))));

  @Effect()
  retrieveUserBudget = this.Actions
    .pipe(ofType(BudgetActionTypes.getUserBudget))
    .pipe(withLatestFrom(this.Store.select(UserSelectors.getUserId)))
    .pipe(switchMap(([_, user_id]: [any, string]) => this.FirebaseService.getUserBudget(user_id)
    .pipe(map((user_budget: any) => new getUserBudgetSucceeded(user_budget)), catchError((err: any) => observableOf(new getUserBudgetFailed())))));

  @Effect()
  retrieveBudgetCategories = this.Actions
    .pipe(ofType(BudgetActionTypes.getBudgetCategories))
    .pipe(withLatestFrom(this.Store.select(UserSelectors.getUserId)))
    .pipe(switchMap(([_, user_id]: [any, string]) => this.FirebaseService.getBudgetCategories(user_id)
    .pipe(map((user_budget: any) => new getBudgetCategoriesSucceeded(user_budget)), catchError((err: any) => observableOf(new getBudgetCategoriesFailed())))));
}