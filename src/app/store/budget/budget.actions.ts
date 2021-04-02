import { Action } from '@ngrx/store';
import { CalendarViewPeriod } from 'angular-calendar';
import { UserBudget, BudgetCategory, Expense, FirebaseExpense, FinanceGoal } from './budget.model';

export enum BudgetActionTypes {
  editTotalAmount = '[budget] edit the total budget amount',
  getExpenses = '[budget] get expenses',
  getExpensesSucceeded = '[budget] get expenses succeeded',
  getExpensesFailed = '[budget] get expeneses failed',
  updateSelectedCalendarDate = '[calendar] update selected calendar date',
  updateDisplayedExpenses = '[calendar] update displayed expenses',
  updateExpense = '[expense] update selected expense',
  addExpense = '[expense] add expense',
  getBudgetCategories = '[budget category] get budget categories',
  getBudgetCategoriesSucceeded = '[budget category] get budget categories succeeded',
  getBudgetCategoriesFailed = '[budget category] get budget categories failed',
  updateBudgetCategories = '[budget category] update budget categories',
  createBudgetCategory = '[budget category] create budget category',
  removeExpense = '[budget category] remove selected expense',
  getUserBudget = '[budget calendar] get budget calendar',
  getUserBudgetSucceeded = '[budget calendar] get budget calendar succeeded',
  getUserBudgetFailed = '[budget calendar] get budget calendar failed',
  updateUserBudget = '[budget calendar] update budget calendar information',
  getFinanceGoals = '[finance goals] get finance goals',
  getFinanceGoalsSucceeded = '[finance goals] get finance goals succeeded',
  getFinanceGoalsFailed = '[finance goals] get finance goals failed',
  updateFinanceGoals = '[finance goals] update finance goals'
}

export class editTotalAmount implements Action {
  readonly type = BudgetActionTypes.editTotalAmount;
  constructor(readonly total_amount: number) {}
}

export class getExpenses implements Action {
  readonly type = BudgetActionTypes.getExpenses;
}

export class getExpensesSucceeded implements Action {
  readonly type = BudgetActionTypes.getExpensesSucceeded;
  constructor(readonly expenses: FirebaseExpense[]) {}
}

export class getExpensesFailed implements Action {
  readonly type = BudgetActionTypes.getExpensesFailed;
}

export class updateExpense implements Action {
  readonly type = BudgetActionTypes.updateExpense;
  constructor(readonly expense: Expense) {}
}

export class updateSelectedCalendarDate implements Action {
  readonly type = BudgetActionTypes.updateSelectedCalendarDate;
  constructor(readonly selected_calendar_date: Date) {}
}

export class updateDisplayedExpenses implements Action {
  readonly type = BudgetActionTypes.updateDisplayedExpenses;
  constructor(readonly expenses: Expense[]) {}
}

export class getBudgetCategories implements Action {
  readonly type = BudgetActionTypes.getBudgetCategories;
}

export class getBudgetCategoriesSucceeded implements Action {
  readonly type = BudgetActionTypes.getBudgetCategoriesSucceeded;
  constructor(readonly budget_categories: BudgetCategory[]) {}
}

export class getBudgetCategoriesFailed implements Action {
  readonly type = BudgetActionTypes.getBudgetCategoriesFailed;
}

export class updateBudgetCategories implements Action {
  readonly type = BudgetActionTypes.updateBudgetCategories;
  constructor(readonly budget_categories: BudgetCategory[]) {}
}

export class createBudgetCategory implements Action {
  readonly type = BudgetActionTypes.createBudgetCategory;
  constructor(readonly budget_categroy: BudgetCategory) {}
}

export class addExpense implements Action {
  readonly type = BudgetActionTypes.addExpense;
  constructor(readonly expense: Expense) {}
}

export class removeExpense implements Action {
  readonly type = BudgetActionTypes.removeExpense;
  constructor(readonly expense: Expense) {}
}

export class getUserBudget implements Action {
  readonly type = BudgetActionTypes.getUserBudget;
}

export class getUserBudgetSucceeded implements Action {
  readonly type = BudgetActionTypes.getUserBudgetSucceeded;
  constructor(readonly budget_calendar: UserBudget) {}
}

export class getUserBudgetFailed implements Action {
  readonly type = BudgetActionTypes.getUserBudgetFailed;
}

export class updateUserBudget implements Action {
  readonly type = BudgetActionTypes.updateUserBudget;
  constructor(readonly budget_calendar: UserBudget) {}
}

export class getFinanceGoals implements Action {
  readonly type = BudgetActionTypes.getFinanceGoals;
}

export class getFinanceGoalsSucceeded implements Action {
  readonly type = BudgetActionTypes.getFinanceGoalsSucceeded;
  constructor(readonly finance_goal: FinanceGoal) {}
}

export class getFinanceGoalsFailed implements Action {
  readonly type = BudgetActionTypes.getFinanceGoalsFailed;
}

export class updateFinanceGoals implements Action {
  readonly type = BudgetActionTypes.updateFinanceGoals;
  constructor(readonly finance_goal: FinanceGoal) {}
}

export type BudgetActions =
| editTotalAmount
| getExpenses
| getExpensesSucceeded
| getExpensesFailed
| updateSelectedCalendarDate
| updateExpense
| addExpense
| removeExpense
| updateDisplayedExpenses
| getBudgetCategories
| getBudgetCategoriesSucceeded
| getBudgetCategoriesFailed
| updateBudgetCategories
| createBudgetCategory
| getUserBudget
| getUserBudgetSucceeded
| getUserBudgetFailed
| updateUserBudget
| getFinanceGoals
| getFinanceGoalsSucceeded
| getFinanceGoalsFailed
| updateFinanceGoals;