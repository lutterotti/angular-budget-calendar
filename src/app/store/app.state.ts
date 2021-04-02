import { User } from './user/user.model';
import { BudgetData } from './budget/budget.model';

export interface App {
  user: User,
  budget_state: BudgetData
}

export interface AppState {
  app: App
}