import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../store/app.state';
import { BudgetCategory } from '../store/budget/budget.model';
import { budgetStateSelectors } from '../store/budget/budget.selector';
import { cloneDeep } from 'lodash';
import { updateBudgetCategories } from '../store/budget/budget.actions';
import { FirebaseService } from '../services/firebase.service';
import { UserSelectors } from '../store/user/user.selectors';

@Component({
  selector: 'edit-budget-categories-modal',
  styles: [`
    .edit-categories__heading {
      display: flex;
      justify-content: start;
      align-items: center;
      width: 100%;
      padding: 16px 12px;
    }

    input {
      padding: 3px 6px;
      letter-spacing: 1.05px;
      line-height: 1;
      font-weight: 400;
      font-size: 15px;
      max-width: 120px;
      text-transform: capitalize;
    }

    .scroll-content {
      padding-bottom: 0 !important;
    }

    .budget-dropdown {
      width: 100%;
      padding: 4px 6px;
      border-radius: 4px;
      border: 1px solid #a7a7a7;
      margin-right: 15px;
    }

    .input-container {
      display: flex;
      flex-direction: column;
      padding: 8px;
      align-items: flex-start;
      justify-content: space-between;
      width: 100%;
    }

    .input-label {
      font-weight: 600;
      color: #858585;
      font-size: 12px;
      padding-left: 4px;
    }

    .label-container {
      display: flex;
      justify-content: flex-start;
      flex-direction: row;
    }

    .button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 14px 10px;
      border-radius: 4px;
    }

    .modal-button--cancel {
      cursor: pointer;
      align-items: center;
      background: #c953c9;
      border-radius: 5px;
      color: white;
      display: flex;
      font-size: 15px;
      font-weight: 600;
      justify-content: center;
      letter-spacing: 1.2px;
      line-height: 1;
      margin-right: 10px;
      padding: 8px 10px;
      text-transform: uppercase;
      width: 100%;
    }

    .modal-button--update {
      cursor: pointer;
      align-items: center;
      background: #913591;
      border-radius: 5px;
      color: white;
      display: flex;
      font-size: 15px;
      font-weight: 600;
      justify-content: center;
      letter-spacing: 1.2px;
      line-height: 1;
      padding: 8px 10px;
      text-transform: uppercase;
      width: 100%;
    }

    .edit-categories-container {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      height: 550px !important;
    }

    .edit-categories-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: hidden;
      overflow-y: scroll;
    }

    .title {
      white-space: nowrap;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .remove-budget-category {
      color: #9e9e9e;
      font-size: 18px;
      padding-top: 3px;
    }
  `],
  template: `
    <ion-content [scrollY]="false" [scrollX]="false" style="height: 520px;">
      <div class="content-container" style="overflow: hidden;">
        <div class="main-display" style="overflow: hidden; overflow-y: scroll;">
          <div class="header-container" style="justify-content: center;">
            <h4 class="header-content">Edit Budget Categories</h4>
          </div>
          <div class="edit-categories-content">
            <div class="input-container" style="position: relative;" *ngFor="let category of budget_categories">
              <div style="display: flex; flex-direction: row;">
                <span class="title" style="margin-right: 8px;">{{category.category_name}}</span>
                <i class="zi-close-outline remove-budget-category" (click)="removeBudgetCategory(category)"></i>
              </div>
              <div class="label-container">
                <select class="budget-dropdown" [(ngModel)]="category.active">
                  <option [ngValue]="true">Active</option>
                  <option [ngValue]="false">Inactive</option>
                </select>
                <input class="expense-input" type="text" [ngModel]="category.alotted_funds | currency:'USD':'symbol' : '1.0'" [ngModelOptions]="{updateOn:'blur'}" (ngModelChange)="category.alotted_funds=cleanPipe($event)"/>
              </div>
            </div>
          </div>
          <div class="button-container">
            <div class="modal-button--cancel" (click)="close()">Cancel</div>
            <div class="modal-button--update" (click)="update()">Update</div>
          </div>
        </div>
      </div>
    </ion-content>
  `
})
export class EditBudgetCategoriesModalComponent implements OnInit, OnDestroy {
  public budget_categories: BudgetCategory[];
  public removed_budget_categories: BudgetCategory[] = [];
  private user_id: string;
  private destroy$ = new Subject<void>();

  constructor(private Store: Store<AppState>, private NgbActiveModal: NgbActiveModal, private FirebaseService: FirebaseService) {}

  ngOnInit() {
    this.Store.select(budgetStateSelectors.getBudgetCategories)
      .pipe(takeUntil(this.destroy$))
      .subscribe((budget_categories: BudgetCategory[]) => this.budget_categories = cloneDeep(budget_categories));


    this.Store.select(UserSelectors.getUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user_id: string) => this.user_id = user_id);
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  removeBudgetCategory(removed_budget_category: BudgetCategory) {
    this.removed_budget_categories = this.removed_budget_categories.concat(removed_budget_category);
    this.budget_categories = this.budget_categories.filter((budget_category: BudgetCategory) => budget_category.category_id !== removed_budget_category.category_id);
  }

  close() {
    this.NgbActiveModal.dismiss();
  }

  async update() {
    this.removed_budget_categories.map((removed_budget_category: BudgetCategory) => this.FirebaseService.removeBudgetCategory(this.user_id, removed_budget_category));
    this.budget_categories.map((budget_category: BudgetCategory) => this.FirebaseService.updateBudgetCategory(this.user_id, budget_category));
    this.Store.dispatch(new updateBudgetCategories(this.budget_categories));
    this.NgbActiveModal.close();
  }

  cleanPipe(amount: string) {
    return parseInt(amount.toString().replace(/[^0-9]/, '' ), 10);
  }
}