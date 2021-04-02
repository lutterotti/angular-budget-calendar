import { MemoizedSelector, createFeatureSelector } from '@ngrx/store';
import { AppState, App } from './app.state';
import { User } from './user/user.model';
import { BudgetData } from './budget/budget.model';

export const userSelector = createFeatureSelector<User>('user');
export const budgetStateSelector = createFeatureSelector<BudgetData>('budget_state');