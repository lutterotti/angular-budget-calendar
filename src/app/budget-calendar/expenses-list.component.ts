import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateExpenseModalComponent } from '../modals/update-calendar-expense-modal.component';
import { AppState } from '../store/app.state';
import { BudgetCategory, BudgetCategoryNames, Expense } from '../store/budget/budget.model';
import { budgetStateSelectors } from '../store/budget/budget.selector';

@Component({
  selector: 'expenses-list',
  styles: [`
    .expense-list-container {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      overflow: hidden;
      background: #faf3cb21;
    }

    .expense-list-title {
      display: flex;
      align-content: center;
      justify-content: flex-start;
      height: 50px;
      width: 100%;
      background: #9f49e71f;
      box-shadow: 0px 2px 7px 0px rgba(0,0,0,0.2);
      padding: 12px 8px;
      z-index: 1;
      color: #373737;
    }

    .expense-title {
      font-size: 14px;
      font-weight: 600;
      font-style: italic;
      letter-spacing: 0.2px;
      color: #1C1C1C;
    }

    .expense-date {
      font-style: italic;
      font-size: 12px;
      font-weight: 500;
      margin-left: 8px;
      color: #9C9C9C;
    }

    .expense-amount {
      font-size: 12px;
      font-weight: 500;
      color: #9C9C9C;
    }

    .expense {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      border-bottom: 1px solid #ececec;
    }

    .expense--first-row {
      display: flex;
      justify-content: flex-start;
      align-items: baseline;
    }

    .expense--second-row {
      display: flex;
      justify-content: flex-start;
      align-items: baseline;
    }

    .expense-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: scroll;
    }
  `],
  template: `
    <ion-content [scrollY]="false" [scrollX]="false">
      <div class="full expense-list-container">
        <div class="expense-list-title">
          <h6 style="height: 20px;">{{(selected_calendar_date$ | async) | date:'EEEE, MMMM d'}}</h6>
        </div>
        <div class="full-width expense-container" *ngIf="(expenses$ | async)?.length">
          <div class="full-width expense" *ngFor="let expense of (expenses$ | async)" (click)="editExpense(expense)">
            <div style="height: 100%; width: 30px;" [ngStyle]="{'background': displayBudgetCategoryColour(expense)}"></div>
            <div style="display: flex; height: 100%; width: 100%; flex-direction: column; justify-content: flex-start; align-items: center; padding: 8px;">
              <div class="full-width expense--first-row">
                <span class="expense-title">{{expense.title}}</span>
                <span class="expense-date"> {{expense.start | date:'EEEE, MMMM d'}}</span>
              </div>
              <div class="full-width expense--second-row">
                <span class="expense-amount"> &#36;{{expense.amount}}</span>
              </div>
            </div>
          </div>
        </div>
        <div style="padding: 12px;" *ngIf="!(expenses$ | async)?.length">
          <span style="color: #6e6e6e; font-style: italic; text-transform: capitalize;">no expenses for today!</span>
        </div>
      </div>
    </ion-content>
  `
})
export class ExpensesListComponent implements OnInit, OnDestroy {
  public expenses$: Observable<Expense[]>;
  public budget_categories: BudgetCategory[];
  public BudgetCategoryNames: BudgetCategoryNames;
  public selected_calendar_date$: Observable<Date>;

  private destroy$ = new Subject<void>();

  constructor(private Store: Store<AppState>, private NgbModal: NgbModal) {}
  ngOnInit() {
    this.expenses$ = this.Store.select(budgetStateSelectors.getSelectedDisplayedExpenses);
    this.selected_calendar_date$ = this.Store.select(budgetStateSelectors.getSelectedCalendarDate);

    this.Store.select(budgetStateSelectors.getBudgetCategories)
      .pipe(takeUntil(this.destroy$))
      .subscribe((budget_categories: BudgetCategory[]) => this.budget_categories = budget_categories);
  }
  ngOnDestroy() {
    this.destroy$.next();
  }

  editExpense(expense: Expense) {
    const modalRef = this.NgbModal.open(UpdateExpenseModalComponent, {windowClass: 'calendar-modal'});
    modalRef.componentInstance.expense = [expense];
  }

  displayBudgetCategoryColour(expense: Expense) {
    const [budget_category] = this.budget_categories.filter((budget_category: BudgetCategory) => expense.category === budget_category.category_name);
    return budget_category.display_colour;
  }
}
