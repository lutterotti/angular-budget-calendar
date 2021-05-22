import { BudgetDataReducer } from './budget/budget.reducer';
import { reducer, UserReducer } from './user/user.reducer';
import { InjectionToken } from '@angular/core';
import { ActionReducerMap } from '@ngrx/store';
import { App } from './app.state';

export const REDUCERS = {
  budget_state: BudgetDataReducer,
  user: reducer
}

export const reducerToken = new InjectionToken<ActionReducerMap<App>>('APP_REDUCERS');

export function getReducers() {
  return REDUCERS;
}

export const reducerProvider = [{ provide: reducerToken, useFactory: getReducers }];