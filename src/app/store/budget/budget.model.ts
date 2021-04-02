import { Frequency, Weekday } from 'rrule';

export interface BudgetData {
  expenses: Expense[];
  display_expenses: Expense[];
  budget_categories: BudgetCategory[];
  total_amount: number;
  user_budget: UserBudget;
  selected_calendar_date: Date;
  finance_goals: FinanceGoal;
}

interface RecurringEvent {
  freq: Frequency;
  bymonth?: number;
  bymonthday?: number;
  byweekday?: Weekday[];
}

export interface Expense {
  actions?: any[];
  allDay?: boolean;
  amount?: number;
  category: string;
  color?: any;
  connection_id?: string;
  draggable?: boolean;
  end?: Date;
  expense_id: string;
  recurring_expense: boolean;
  resizable?: any;
  rrule?: RecurringEvent;
  start?: Date;
  title?: string;
}

export interface FirebaseExpense {
  actions?: any[];
  allDay?: boolean;
  amount?: number;
  category: string;
  color?: any;
  connection_id?: string;
  draggable?: boolean;
  end?: Date;
  expense_id: string;
  recurring_expense: boolean;
  resizable?: any;
  rrule?: RecurringEvent;
  start?: string;
  title?: string;
}



export enum BudgetCategoryNames {
  Clothing = 'Clothing',
  Debt = 'Debt',
  Education = 'Education',
  Entertainment = 'Entertainment',
  Food = 'Food',
  Gifts = 'Gifts & Donations',
  Household = 'Household',
  Housing = 'Housing',
  Insurance = 'Insurance',
  Medical = 'Medical & Healthcare',
  Other = 'Other',
  Personal = 'Personal',
  Retirement = 'Retirement',
  Transportation = 'Transportation',
  Utilities = 'Utilities',
  Work = 'Work Expense',
  Pet = 'Pet',
  Starbucks = 'Starbucks',
  Skip_Dishes = 'Skip the Dishes',
  Savings = 'Savings'
}

export interface BudgetCategory {
  category_name: string;
  category_id: string;
  alotted_funds: number;
  display_colour?: string;
  active: boolean;
  expenses_amount?: number;
}

export interface UserBudget {
  reset_start_date?: number;
  reset_frequency: BudgetFrequency;
  budget_amount: number;
  savings_amount: number;
}

export interface FinanceGoal {
  goal_name?: string;
  goal_id?: string;
  current_amount_saved: number; // when the action of a budget reset occrus we can calculate this amount
}

export enum BudgetFrequency {
  MONTHLY_SELECTED_DATE = 'selected date',
  MONTHLY_END_OF_MONTH = 'end of month',
  SEMI_WEEKLY = 'semi-weekly',
  BI_WEEKLY = 'bi-weekly',
  WEEKLY = 'weekly'
}