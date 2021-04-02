import { createSelector } from 'reselect';
import { budgetStateSelector } from '../app.selector';
import { BudgetCategory, BudgetData, BudgetFrequency, Expense, UserBudget } from './budget.model';
import { subMonths, endOfMonth, isSameDay, isBefore, startOfMonth, isAfter, subDays, addMonths } from 'date-fns';
import { sortBy, isEmpty, flatten } from 'lodash';
import * as moment from 'moment';
import RRule from 'rrule';

export interface userBudgetRange {
  start_of_range: Date;
  end_of_range: Date;
}

export const getBudgetState = createSelector(budgetStateSelector, (budget_state: BudgetData) => budget_state ? budget_state : {} as BudgetData);
export const getExpenses = createSelector(getBudgetState, (budget_state: BudgetData) => budget_state.expenses ? budget_state.expenses : []);
export const getSelectedCalendarDate = createSelector(getBudgetState, (budget_state: BudgetData) => budget_state.selected_calendar_date ? budget_state.selected_calendar_date : null);
export const getSelectedDateExpenses = createSelector(getExpenses, getSelectedCalendarDate,  (expenses: Expense[], selected_date: Date) => expenses.filter((expense: Expense) => isSameDay(expense.start, selected_date)));
export const getDisplayedExpenses = createSelector(getBudgetState, (budget_state: BudgetData) => budget_state.display_expenses ? budget_state.display_expenses : []);
export const getSelectedDisplayedExpenses = createSelector(getDisplayedExpenses, getSelectedCalendarDate, (expenses : Expense[], selected_date: Date) => expenses.filter((expense: Expense) => isSameDay(expense.start, selected_date)));
export const getBudgetCategories = createSelector(getBudgetState, (budget_state: BudgetData) => budget_state.budget_categories ? sortBy(budget_state.budget_categories, 'category_name') : []);
export const getActiveBudgetCategories = createSelector(getBudgetCategories, (budget_categories: BudgetCategory[]) => budget_categories.filter((category: BudgetCategory) => category.active));
export const getUserBudget = createSelector(getBudgetState, (budget_state: BudgetData) => budget_state ? budget_state.user_budget : {} as UserBudget);
export const hasUserBudget = createSelector(getUserBudget, (user_budget: UserBudget) => !isEmpty(user_budget));
export const determineRangeOfBudget = createSelector(getUserBudget, (user_budget: UserBudget) => {
  const moment_date = moment().utc().toString();
  const current_date = new Date(moment_date);

  switch (user_budget.reset_frequency) {
    case BudgetFrequency.MONTHLY_END_OF_MONTH: {
      const start_of_range = startOfMonth(current_date);
      const end_of_range = endOfMonth(current_date);
      return {start_of_range, end_of_range};
    }
    case BudgetFrequency.MONTHLY_SELECTED_DATE: {
      // this is strange
      const selected_date = new Date(`${current_date.getMonth() + 1}-${user_budget.reset_start_date}-${current_date.getFullYear()}`);
      const end_of_range = new Date(selected_date);
      const start_of_range = subMonths(selected_date, 1);
      const range_check = Math.ceil((end_of_range.getTime() - current_date.getTime()) / 1000 / 60 / 60 / 24)

      if (range_check < 0) {
        return {start_of_range: addMonths(start_of_range, 1), end_of_range: addMonths(end_of_range, 1)};
      } else {
      return {start_of_range, end_of_range};
      }
    }
  }
});
export const getExpensesOfCurrentMonth = createSelector(getExpenses, determineRangeOfBudget, (expenses: Expense[], user_budget_range: userBudgetRange) => {
  if (user_budget_range) {
    const {start_of_range, end_of_range} = user_budget_range;
    const moment_date = moment().utc().toString();

    const static_expenses = expenses.filter((expense: Expense) => !expense.recurring_expense && (!isBefore(expense.start, start_of_range) && !isAfter(expense.start, end_of_range)));
    const filtered_expenses = expenses.filter((expense: Expense) => expense.recurring_expense);
    const recurring_expenses = filtered_expenses.map((recurring_expense: Expense) => {
      const rule: RRule = new RRule({
        ...recurring_expense.rrule,
        dtstart: moment(start_of_range).startOf("day").toDate(),
        until: moment(end_of_range).endOf("day").toDate()
      });

      const rules = rule.all().map((date) => ({...recurring_expense, start: moment(date).toDate()} as Expense));

      return rules;
    });

    return static_expenses.concat(flatten(recurring_expenses));
  } else {
    return [] as Expense[];
  }
});

export const getTotalledBudgetCategoryAmounts = createSelector(getBudgetCategories, getExpensesOfCurrentMonth, (budget_categories: BudgetCategory[], expenses: Expense[]) => {
  const display_budget_categories = budget_categories.map((budget_category: BudgetCategory) => {
    const filtered_expenses = expenses.filter((expense: Expense) => expense.category === budget_category.category_name);
    const expenses_amount = filtered_expenses.reduce((total: number, expense: Expense) => total + expense.amount, 0);

    return {...budget_category, expenses_amount}
  }).filter((budget_category: BudgetCategory) => budget_category.expenses_amount || budget_category.active);

  return display_budget_categories;
});

export const getTotalledExpenseAmount = createSelector(getExpensesOfCurrentMonth, (expenses: Expense[]) => expenses.length ? expenses.reduce((total: number, expense: Expense) => total + expense.amount, 0) : 0);

export const getDaysUntilNewBudget = createSelector(determineRangeOfBudget, (range: {start_of_range: Date, end_of_range: Date}) => {
  if (range) {
    const { end_of_range } = range;
    const current_date = new Date();
    return Math.ceil((end_of_range.getTime() - current_date.getTime()) / 1000 / 60 / 60 / 24);
  } else {
    return 0;
  }
});

export const budgetStateSelectors = {
  getBudgetState,
  getExpenses,
  getSelectedCalendarDate,
  getSelectedDateExpenses,
  getDisplayedExpenses,
  getSelectedDisplayedExpenses,
  getBudgetCategories,
  getActiveBudgetCategories,
  getUserBudget,
  hasUserBudget,
  getExpensesOfCurrentMonth,
  getTotalledBudgetCategoryAmounts,
  getTotalledExpenseAmount,
  getDaysUntilNewBudget
};

