import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AppState } from '../store/app.state';
import { Store } from '@ngrx/store';
import { UserSelectors } from '../store/user/user.selectors';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { budgetStateSelectors } from '../store/budget/budget.selector';
import { BudgetCategory, UserBudget } from '../store/budget/budget.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddExpenseModalComponent } from '../modals/add-calendar-expense-modal.component';

@Component({
  selector: 'app-home',
  styles: [`
    .circle-container {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: 100%;
    }

    input::placeholder {
      color: #bbb;
    }

    .login-field {
      border: 1px solid #ddd;
      padding: 2px 4px;
      border-radius: 5px;
      color: #888;
    }

    .home-overview__container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: hidden;
      overflow-y: scroll;
      z-index: 100;
    }
  `],
  template: `
    <ion-content [scrollY]="false" [scrollX]="false">
      <div class="content-container" style="height: 100vh; width: 100vw; position: relative;">
        <div class="main-display">
          <div *ngIf="(user_exists$ | async); then authenticated else guest"></div>

          <!-- User NOT logged in -->
          <ng-template #guest>
            <div class="home-overview__container">
              <div class="header-container" style="margin-bottom: 0px;">
                <h4 class="header-content">Welcome!</h4>
              </div>
              <div style="display: flex; justify-content: center; align-items: center; flex-direction: column; height: 100%;">
                <input class="login-field" style="margin-bottom: 8px;" type="text" placeholder="Email" [(ngModel)]="user_email" required autofocus>
                <input class="login-field" type="password" placeholder="Password" [(ngModel)]="user_password" required>
                <div style="display: flex; width: 100%; justify-content: center;">
                  <button class="fa-button-primary" (click)="userSignIn()">Login</button>
                  <button class="fa-button-secondary" style="margin-left: 12px;" (click)="userSignUp()">Sign Up</button>
                </div>
              </div>
            </div>
          </ng-template>

          <!-- User logged in -->
          <ng-template #authenticated>
          <div class="home-overview__container">
              <div class="header-container" style="margin-bottom: 0px;">
                <h4 class="header-content">Welcome Back!</h4>
                <div class="add-expense" (click)="openAddExpenseModal()">ADD EXPENSE</div>
              </div>
              <div class="circle-container">
                <circle-progress
                  [percent]="generatePercent()"
                  [radius]="130"
                  [titleFontSize]="34"
                  [titleFontWeight]="500"
                  [unitsFontSize]="19"
                  [subtitleFontSize]="18"
                  [title]="expenses_amount"
                  [startFromZero]="true"
                  [outerStrokeWidth]="28"
                  [innerStrokeWidth]="20"
                  [outerStrokeLinecap]="'round'"
                  [outerStrokeColor]="'#9B4DCB'"
                  [innerStrokeColor]="'#A1EBED'"
                  [animation]="true"
                  [units]="'/ ' + user_budget?.budget_amount"
                  [subtitle]="days_until_reset"
                  [backgroundOpacity]="0"
                  [animationDuration]="300">
                </circle-progress>
              </div>
            </div>
          </ng-template>
        </div>
      </div>
    </ion-content>
  `
})
export class MainDisplayComponent implements OnInit, OnDestroy {
  public progress: number = 100;
  public user_email: string;
  public user_password: string;
  public user_exists$: Observable<boolean>;
  public user_budget: UserBudget;
  public expenses_amount: number;
  public days_until_reset: string;
  private budget_categories: BudgetCategory[];

  private destroy$ = new Subject<void>();

  constructor(private Store: Store<AppState>, public AuthService: AuthService, public AngularFireAuth: AngularFireAuth, private NgbModal: NgbModal) {}

  ngOnInit() {
    this.AuthService.autoLoginUser();

    this.Store.select(budgetStateSelectors.getBudgetCategories)
      .pipe(takeUntil(this.destroy$))
      .subscribe((budget_categories: BudgetCategory[]) => this.budget_categories = budget_categories);

    this.Store.select(budgetStateSelectors.getDaysUntilNewBudget)
    .pipe(takeUntil(this.destroy$))
    .subscribe((days_left: number) => this.days_until_reset = days_left > 1 ? `${days_left} days left` : `${days_left} day left`);
    this.Store.select(budgetStateSelectors.getTotalledExpenseAmount)
    .pipe(takeUntil(this.destroy$))
    .subscribe((expenses_amount: number) => this.expenses_amount = expenses_amount);
    this.Store.select(budgetStateSelectors.getUserBudget)
    .pipe(takeUntil(this.destroy$))
    .subscribe((user_budget: UserBudget) => this.user_budget = user_budget);
    this.user_exists$ = this.Store.select(UserSelectors.isUserLoggedIn);
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  async userSignIn() {
    try {
      await this.AuthService.login(this.user_email, this.user_password);
    } catch (error) {
      this.user_email = '';
      this.user_password = '';
    }
  }

  async userSignUp() {
    await this.AuthService.register(this.user_email, this.user_password, this.budget_categories);

    this.user_email = '';
    this.user_password = '';
  }

  userLogOut() {
    this.AuthService.signOut();
  }

  openAddExpenseModal() {
    const modalRef = this.NgbModal.open(AddExpenseModalComponent, {windowClass: 'calendar-modal'});
    modalRef.componentInstance.dateOnOpen = new Date();
  }

  generatePercent() {
    return this.expenses_amount ? (this.expenses_amount / this.user_budget.budget_amount) * 100 : 0;
  }
}
