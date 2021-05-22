import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { UserBudget, BudgetFrequency } from '../store/budget/budget.model';
import { cloneDeep, isEmpty } from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { budgetStateSelectors } from '../store/budget/budget.selector';
import { updateUserBudget } from '../store/budget/budget.actions';
import { FirebaseService } from '../services/firebase.service';
import { UserSelectors } from '../store/user/user.selectors';

@Component({
  selector: 'edit-budget-modal',
  styles: [`
    .edit-budget__heading {
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
      flex-direction: column;
      margin-bottom: 15px;
    }

    .button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 10px 10px;
      border-radius: 4px;
    }

    .edit-budget-container {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      height: 391px !important;
    }

    .edit-budget-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
  `],
  template: `
    <ion-content [scrollY]="false" [scrollX]="false" style="height: 520px;">
      <div class="content-container">
        <div class="edit-budget-container">
          <div class="edit-budget__heading">
            <h4 style="font-weight: 600; letter-spacing: 0.4px;">Edit Budget</h4>
          </div>
          <div class="edit-budget-content">
            <div class="input-container" style="padding-top: 12px;">
              <div class="label-container">
                <span class="input-label">Frequency</span>
                <select class="budget-dropdown" [(ngModel)]="user_budget.reset_frequency" (ngModelChange)="handleFrequencyChange($event)">
                  <option [ngValue]="BudgetFrequency.MONTHLY_END_OF_MONTH">End Of Month</option>
                  <option [ngValue]="BudgetFrequency.MONTHLY_SELECTED_DATE">Selected Date of Month</option>
                </select>
              </div>
              <div class="label-container" *ngIf="user_budget.reset_frequency === BudgetFrequency.MONTHLY_SELECTED_DATE">
                <span class="input-label">Restart Date</span>
                <input class="expense-input" type="number" [(ngModel)]="user_budget.reset_start_date"/>
              </div>
              <div class="label-container">
                <span class="input-label">Budget Amount</span>
                <input class="expense-input" type="text" [ngModel]="user_budget.budget_amount | currency:'USD':'symbol' : '1.0'" [ngModelOptions]="{updateOn:'blur'}"  (ngModelChange)="user_budget.budget_amount=cleanPipe($event)"/>
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
export class EditBudgetModalComponent implements OnInit, OnDestroy {
  public user_budget: UserBudget = {} as UserBudget;

  public BudgetFrequency = BudgetFrequency;

  private fake_user_budget: UserBudget = {
    reset_frequency: BudgetFrequency.MONTHLY_END_OF_MONTH,
    reset_start_date: null,
    budget_amount: 0,
    savings_amount: 0
  }
  private has_user_budget: boolean = false;
  private user_id: string;
  private destroy$ = new Subject<void>();

  constructor(private Store: Store<AppState>, private NgbActiveModal: NgbActiveModal, private FirebaseService: FirebaseService) {}

  ngOnInit() {
    this.Store.select(budgetStateSelectors.getUserBudget)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user_budget: UserBudget) => this.user_budget = !isEmpty(user_budget) ? {...this.fake_user_budget, ...cloneDeep(user_budget)} : this.fake_user_budget);

    this.Store.select(budgetStateSelectors.hasUserBudget)
      .pipe(takeUntil(this.destroy$))
      .subscribe((has_user_budget: boolean) => this.has_user_budget = has_user_budget);


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

  handleFrequencyChange(frequency: BudgetFrequency) {
    if (frequency === BudgetFrequency.MONTHLY_SELECTED_DATE) {
      this.user_budget = {...this.user_budget, reset_start_date: 30}
    } else {
      this.user_budget = {...this.user_budget, reset_start_date: null}
    }
  }

  update() {
    if (this.has_user_budget) {
      this.FirebaseService.updateUserBudget(this.user_id, this.user_budget);
    } else {
      this.FirebaseService.createUserBudget(this.user_id, this.user_budget);
    }

    this.Store.dispatch(new updateUserBudget(this.user_budget));
    this.NgbActiveModal.close();
  }

  cleanPipe(amount: string) {
    return parseInt(amount.toString().replace(/[^0-9]/, '' ), 10);
  }
}