import { Injectable } from "@angular/core";
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { BudgetCategory, Expense, FirebaseExpense, UserBudget } from '../store/budget/budget.model';

@Injectable()
export class FirebaseService {
  private expense_list: AngularFireList<FirebaseExpense>;
  private user_budget: AngularFireObject<UserBudget>;
  private budget_categories: AngularFireList<BudgetCategory>;

  constructor(private AngularFireDatabase: AngularFireDatabase) {}

  updateExpense(expense: Expense, user_id: string) {
    const serialized_expense = JSON.parse( JSON.stringify(expense));
    return this.AngularFireDatabase.database.ref(`users/${user_id}/expenses/${serialized_expense.expense_id}`).update(serialized_expense);
  }

  createExpense(expense: Expense, user_id: string) {
    const serialized_expense = JSON.parse( JSON.stringify(expense));
    return this.AngularFireDatabase.database.ref(`users/${user_id}/expenses/${serialized_expense.expense_id}`).set(serialized_expense);
  }

  removeExpense(expense: Expense, user_id: string) {
    return this.AngularFireDatabase.database.ref(`users/${user_id}/expenses/${expense.expense_id}`).remove();
  }

  getExpenses(user_id: string) {
    this.expense_list = this.AngularFireDatabase.list(`/users/${user_id}/expenses`);
    return this.expense_list.valueChanges();
  }

  getUserBudget(user_id: string) {
    this.user_budget = this.AngularFireDatabase.object(`users/${user_id}/user_budget`);
    return this.user_budget.valueChanges();
  }

  createUserBudget(user_id: string, user_budget: UserBudget) {
    return this.AngularFireDatabase.database.ref(`users/${user_id}/user_budget`).set(user_budget);
  }

  updateUserBudget(user_id: string, user_budget: UserBudget) {
    return this.AngularFireDatabase.database.ref(`users/${user_id}/user_budget`).update(user_budget);
  }

  getBudgetCategories(user_id: string) {
    this.budget_categories = this.AngularFireDatabase.list(`/users/${user_id}/budget_categories`);
    return this.budget_categories.valueChanges();
  }

  createBudgeCategory(user_id: string, budget_category: BudgetCategory) {
    return this.AngularFireDatabase.database.ref(`users/${user_id}/budget_categories/${budget_category.category_id}`).set(budget_category);
  }

  updateBudgetCategory(user_id: string, budget_category: BudgetCategory) {
    return this.AngularFireDatabase.database.ref(`users/${user_id}/budget_categories/${budget_category.category_id}`).set(budget_category);
  }

  removeBudgetCategory(user_id: string, budget_category: BudgetCategory) {
    return this.AngularFireDatabase.database.ref(`users/${user_id}/budget_categories/${budget_category.category_id}`).remove();
  }
}