import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { AddBudgetCategoryComponent } from '../modals/add-budget-category-modal.component';
import { EditBudgetCategoriesModalComponent } from '../modals/edit-budget-categories-modal.component';
import { AppState } from '../store/app.state';
import { BudgetCategory } from '../store/budget/budget.model';
import { budgetStateSelectors } from '../store/budget/budget.selector';

@Component({
  selector: 'budget-overview',
  styles: [`
    .budget-overview__heading {
      display: flex;
      position: relative;
      justify-content: start;
      align-items: center;
      width: 100%;
      height: 40px;
      padding: 24px 12px;
    }

    .budget-overview__container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      overflow-y: scroll;
    }

    .budget__title {
      display: flex;
      flex-direction: row;
      width: 100%;
      padding-bottom: 2px;
      font-size: 16px;
      font-weight: 500;
    }

    .budget__container {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 8px 12px 12px 12px;
    }

    .user-title {
      font-size: 18px;
      font-weight: 500;
    }

    .edit-icon {
      cursor: pointer;
      color: #a4a4a4;
      margin-left: 8px;
      border-radius: 100%;
      height: 30px;
      width: 30px;
      padding-left: 6px;
      padding-top: 8px;
      font-size: 15px;
    }

    .add-budget-category {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 24px;
    }

    .budget-category-actions {
      color: #fdfaea;
      border: 2px solid #fdfaea;
      border-radius: 5px;
      padding: 6px;
      font-size: 10px;
      right: 10px;
      font-weight: 700;
    }

    .budget-actions-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-top: 10px;
    }
  `],
  template: `
    <ion-content [scrollY]="false" [scrollX]="false">
      <div class="content-container" style="height: 100vh; width: 100vw;">
        <div class="main-display">
          <div class="header-container" style="margin-bottom: 0px; flex-direction: column; padding: 10px;">
            <h4 class="header-content">Budget Categories</h4>
            <div class="budget-actions-container">
              <div class="budget-category-actions" style="margin-right: 10px;" (click)="openAddBudgetCategory()">ADD CATEGORY</div>
              <div class="budget-category-actions" (click)="handleEditBudgetCategories()">EDIT CATEGORIES</div>
            </div>
          </div>
          <div class="budget-overview__container">
            <div class="budget__container" *ngFor="let category of (budget_categories$ | async)">
              <div class="budget__title">
                <span style="margin-right: 8px; font-weight: 500;">{{category.category_name}}</span>
                <span style="font-size: 12px; color: #999; font-style: italic; line-height: 2.3;">&#36;{{category.expenses_amount}} of &#36;{{category.alotted_funds}}, &#36;{{getAmountLeft(category.expenses_amount, category.alotted_funds)}} left</span>
              </div>
              <horizontal-bar-graph [currentAmount]="category.expenses_amount" [max]="category.alotted_funds"></horizontal-bar-graph>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  `
})
export class BudgetOverviewComponent implements OnInit, OnDestroy {
  public budget_categories$: Observable<BudgetCategory[]>;

  private destroy$ = new Subject<void>();

  constructor(private Store: Store<AppState>, private NgbModal: NgbModal) {}

  ngOnInit() {
    this.budget_categories$ = this.Store.select(budgetStateSelectors.getTotalledBudgetCategoryAmounts);
  }

  ngOnDestroy() {}

  getAmountLeft(expenses_amount: number, alotted_amount: number) {
    return expenses_amount > alotted_amount ? 0 : alotted_amount - expenses_amount;
  }

  handleEditBudgetCategories() {
    this.NgbModal.open(EditBudgetCategoriesModalComponent, {windowClass: 'calendar-modal'});
  }

  openAddBudgetCategory() {
    this.NgbModal.open(AddBudgetCategoryComponent, {windowClass: 'edit-user-budget-modal'});
  }
}