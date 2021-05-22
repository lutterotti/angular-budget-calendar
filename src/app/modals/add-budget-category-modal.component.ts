import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { UserBudget, BudgetFrequency, BudgetCategory } from '../store/budget/budget.model';
import { cloneDeep, isEmpty } from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { budgetStateSelectors } from '../store/budget/budget.selector';
import { createBudgetCategory, updateUserBudget } from '../store/budget/budget.actions';
import { FirebaseService } from '../services/firebase.service';
import { UserSelectors } from '../store/user/user.selectors';
import uuidv4 from 'uuid/v4';

@Component({
  selector: 'add-budget-category-modal',
  styles: [`
    input {
      padding: 3px 6px;
      letter-spacing: 1.05px;
      line-height: 1;
      font-weight: 400;
      font-size: 15px;
      text-transform: capitalize;
    }

    .scroll-content {
      padding-bottom: 0 !important;
    }

    .budget-dropdown {
      padding: 4px 6px;
      border-radius: 4px;
      border: 1px solid #a7a7a7;
    }

    .input-container {
      display: flex;
      flex-direction: column;
      position: relative;
      padding: 8px;
      align-items: flex-start;
      justify-content: space-between;
      width: 100%;
    }

    .input-label {
      font-weight: 600;
      color: #858585;
      font-size: 14px;
      padding-bottom: 4px;
    }

    .label-container {
      display: flex;
      justify-content: flex-start;
      flex-direction: column;
      margin-bottom: 15px;
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

    .add-budget-category-container {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      height: 391px !important;
    }

    .add-budget-category-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      justify-content: space-between;
    }

    .refresh-color {
      position: absolute;
      top: 8px;
      left: 108px;
      font-size: 22px;
    }

    .button--disabled {
      opacity: 50%;
    }
  `],
  template: `
    <ion-content [scrollY]="false" [scrollX]="false" style="height: 520px;">
      <div class="content-container">
        <div class="main-display">
          <div class="header-container">
              <h4 class="header-content">Create Budget Category</h4>
          </div>
          <div class="add-budget-category-content">
            <div style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
              <div class="input-container" style="padding-top: 8px;">
                <span class="input-label">Budget Title</span>
                <input class="expense-input" style="width: 100%;" type="text" [(ngModel)]="budget_category.category_name"/>
              </div>
              <div class="input-container" style="padding-top: 8px;">
                <span class="input-label">Alotted Funds</span>
                <input class="expense-input" style="width: 100%;" type="text" [ngModel]="budget_category.alotted_funds | currency:'USD':'symbol' : '1.0'" [ngModelOptions]="{updateOn:'blur'}" (ngModelChange)="budget_category.alotted_funds=cleanPipe($event)"/>
              </div>
              <div class="input-container" style="padding-top: 8px;">
                <span class="input-label">Active</span>
                <select class="budget-dropdown" style="max-width: 90px" [(ngModel)]="budget_category.active">
                  <option [ngValue]="true">Active</option>
                  <option [ngValue]="false">Inactive</option>
                </select>
              </div>
              <div class="input-container" style="padding-top: 8px;">
                <span class="input-label">Display Color</span>
                <i class="zi-refresh refresh-color" (click)="generateNewDisplayColour()"></i>
                <div style="height: 15px; width: 90px; border-radius: 5px;" [ngStyle]="{'background': budget_category.display_colour}"></div>
              </div>
            </div>
            <div class="button-container">
              <div class="modal-button--cancel" (click)="close()">Cancel</div>
              <div class="modal-button--update" (click)="create()" [ngClass]="{'button--disabled': !canCreateBudgetCategory()}">Create</div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  `
})
export class AddBudgetCategoryComponent implements OnInit, OnDestroy {
  public budget_category: BudgetCategory = {
    category_name: '',
    category_id: uuidv4(),
    alotted_funds: 0,
    display_colour: this.getRandomColor(),
    active: true,
  };

  public BudgetFrequency = BudgetFrequency;

  private user_id: string;
  private destroy$ = new Subject<void>();

  constructor(private Store: Store<AppState>, private NgbActiveModal: NgbActiveModal, private FirebaseService: FirebaseService) {}

  ngOnInit() {
    this.Store.select(UserSelectors.getUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user_id: string) => this.user_id = user_id);
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  close() {
    this.NgbActiveModal.dismiss();
  }

  async create() {
    const can_create = this.canCreateBudgetCategory();
    if (can_create) {
      await this.FirebaseService.createBudgeCategory(this.user_id, this.budget_category);
      this.NgbActiveModal.close();
    }
  }

  generateNewDisplayColour() {
    this.budget_category = {...this.budget_category, display_colour: this.getRandomColor()};
  }

  canCreateBudgetCategory() {
    return this.budget_category.category_name.length;
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  cleanPipe(amount: string) {
    return parseInt(amount.toString().replace(/[^0-9]/, '' ), 10);
  }
}