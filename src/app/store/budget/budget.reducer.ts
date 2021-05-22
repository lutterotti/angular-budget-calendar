import { BudgetActions, BudgetActionTypes } from './budget.actions';
import { BudgetCategory, BudgetCategoryNames, BudgetData, Expense, FirebaseExpense, UserBudget, FinanceGoal, BudgetFrequency } from './budget.model';
import uuidv4 from 'uuid/v4';
import { parseISO } from 'date-fns';

const empty_user_budget = {
  reset_frequency: BudgetFrequency.MONTHLY_END_OF_MONTH,
  budget_amount: 2500,
  savings_amount: 0,
} as UserBudget;

const empty_finance_goal = {} as FinanceGoal;
const budget_categories: BudgetCategory[] = [
  {
  category_name: BudgetCategoryNames.Housing,
  category_id: uuidv4(),
  alotted_funds: 200,
  display_colour: 'red',
  active: true
}, {
  category_name: BudgetCategoryNames.Transportation,
  category_id: uuidv4(),
  alotted_funds: 130,
  display_colour: '#aaa',
  active: true
}, {
  category_name: BudgetCategoryNames.Food,
  category_id: uuidv4(),
  alotted_funds: 100,
  display_colour: 'yellow',
  active: true
}, {
  category_name: BudgetCategoryNames.Utilities,
  category_id: uuidv4(),
  alotted_funds: 180,
  display_colour: 'red',
  active: true
}, {
  category_name: BudgetCategoryNames.Clothing,
  category_id: uuidv4(),
  alotted_funds: 60,
  display_colour: 'purple',
  active: false
}, {
  category_name: BudgetCategoryNames.Medical,
  category_id: uuidv4(),
  alotted_funds: 100,
  display_colour: 'blue',
  active: false
}, {
  category_name: BudgetCategoryNames.Insurance,
  category_id: uuidv4(),
  alotted_funds: 90,
  display_colour: 'orange',
  active: true
}, {
  category_name: BudgetCategoryNames.Household,
  category_id: uuidv4(),
  alotted_funds: 25,
  display_colour: 'azure',
  active: false
}, {
  category_name: BudgetCategoryNames.Personal,
  category_id: uuidv4(),
  alotted_funds: 50,
  display_colour: 'bisque',
  active: false
}, {
  category_name: BudgetCategoryNames.Debt,
  category_id: uuidv4(),
  alotted_funds: 50,
  display_colour: 'cadetblue',
  active: true
}, {
  category_name: BudgetCategoryNames.Retirement,
  category_id: uuidv4(),
  alotted_funds: 90,
  display_colour: 'crimson',
  active: false
}, {
  category_name: BudgetCategoryNames.Education,
  category_id: uuidv4(),
  alotted_funds: 90,
  display_colour: 'darkgreen',
  active: false
}, {
  category_name: BudgetCategoryNames.Gifts,
  category_id: uuidv4(),
  alotted_funds: 15,
  display_colour: 'orange',
  active: false
}, {
  category_name: BudgetCategoryNames.Entertainment,
  category_id: uuidv4(),
  alotted_funds: 90,
  display_colour: 'forestgreen',
  active: false
}, {
  category_name: BudgetCategoryNames.Other,
  category_id: uuidv4(),
  alotted_funds: 100,
  display_colour: 'powderblue',
  active: false
}, {
  category_name: BudgetCategoryNames.Work,
  category_id: uuidv4(),
  alotted_funds: 200,
  display_colour: '#6ec1d4',
  active: false
}, {
  category_name: BudgetCategoryNames.Pet,
  category_id: uuidv4(),
  alotted_funds: 100,
  display_colour: '#ffe987',
  active: true
}, {
  category_name: BudgetCategoryNames.Starbucks,
  category_id: uuidv4(),
  alotted_funds: 200,
  display_colour: '#593896',
  active: false
}, {
  category_name: BudgetCategoryNames.Skip_Dishes,
  category_id: uuidv4(),
  alotted_funds: 200,
  display_colour: '#385396',
  active: false
},];

const initial_state: BudgetData = {
  expenses: [],
  display_expenses: [],
  budget_categories: budget_categories,
  total_amount: null,
  user_budget: empty_user_budget,
  selected_calendar_date: new Date(),
  finance_goals: empty_finance_goal
}

export function updateSelectedExpense(state_expenses: Expense[], updated_expense: Expense): Expense[] {
  return state_expenses.map((expense: Expense) => {
    if (expense.expense_id === updated_expense.expense_id) {
      return updated_expense
    } else {
      return expense;
    }
  })
}

export function addSelectedExpense(state_expenses: Expense[], expense: Expense): Expense[] {
  const generated_expense = {...expense, expense_id: uuidv4()}

  return state_expenses.concat(generated_expense);
}

function removeSelectedExpense(state_expenses: Expense[], removed_expense: Expense) {
  return state_expenses.filter((expense: Expense) => expense.expense_id !== removed_expense.expense_id);
}

function serializeExpenses(expenses: FirebaseExpense[]) {
  return expenses.map((expense: FirebaseExpense) => {
    const string_start = expense.start as string;

    return {...expense, start: parseISO(string_start)}})
}

function receiveUserBudgetCategories(state_categories: BudgetCategory[], user_categories: BudgetCategory[]) {
  return user_categories.length ? user_categories : state_categories;
}

export function BudgetDataReducer(state: BudgetData = initial_state, action: BudgetActions): BudgetData {

  switch(action.type) {
    case BudgetActionTypes.getExpensesSucceeded:
      return {...state, expenses: serializeExpenses(action.expenses)};
    case BudgetActionTypes.updateSelectedCalendarDate:
      return {...state, selected_calendar_date: action.selected_calendar_date};
    case BudgetActionTypes.updateDisplayedExpenses:
      return {...state, display_expenses: action.expenses}
    case BudgetActionTypes.updateExpense:
      return {...state, expenses: updateSelectedExpense(state.expenses, action.expense)}
    case BudgetActionTypes.getBudgetCategoriesSucceeded:
      return {...state, budget_categories: receiveUserBudgetCategories(state.budget_categories, action.budget_categories)};
    case BudgetActionTypes.createBudgetCategory:
      return {...state, budget_categories: state.budget_categories.concat(action.budget_categroy)};
    case BudgetActionTypes.updateBudgetCategories:
      return {...state, budget_categories: action.budget_categories};
    case BudgetActionTypes.addExpense:
      return {...state, expenses: addSelectedExpense(state.expenses, action.expense)};
    case BudgetActionTypes.removeExpense:
      return {...state, expenses: removeSelectedExpense(state.expenses, action.expense)};
    case BudgetActionTypes.getUserBudgetSucceeded:
      return {...state, user_budget: action.budget_calendar ? action.budget_calendar : state.user_budget};
    case BudgetActionTypes.updateUserBudget:
      return {...state, user_budget: action.budget_calendar};
    case BudgetActionTypes.getFinanceGoalsSucceeded:
      return {...state, finance_goals: action.finance_goal};
    case BudgetActionTypes.updateFinanceGoals:
      return {...state, finance_goals: action.finance_goal};
  }

  return state;
}