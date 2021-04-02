import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarDayViewBeforeRenderEvent, CalendarEvent, CalendarMonthViewBeforeRenderEvent, CalendarView, CalendarViewPeriod, CalendarWeekViewBeforeRenderEvent } from 'angular-calendar';
import { isSameDay, isSameMonth, differenceInMonths } from 'date-fns';
import { Frequency, RRule, Weekday } from 'rrule';
import { AppState } from '../store/app.state';
import { BudgetCategory, Expense } from '../store/budget/budget.model';
import { cloneDeep, flatten } from 'lodash';
import { Store } from '@ngrx/store';
import { updateExpense, removeExpense } from '../store/budget/budget.actions';
import { budgetStateSelectors } from '../store/budget/budget.selector';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { FirebaseService } from '../services/firebase.service';
import { UserSelectors } from '../store/user/user.selectors';

@Component({
  selector: 'mini-calendar-modal',
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 10px 10px;
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

    .modal-button--remove {
      cursor: pointer;
      align-items: center;
      background: #fefefe;
      border: 1px solid #c953c9;
      border-radius: 5px;
      color: #c953c9;
      display: flex;
      font-size: 15px;
      font-weight: 600;
      justify-content: center;
      letter-spacing: 1.2px;
      line-height: 1;
      padding: 8px 10px;
      margin-right: 10px;
      text-transform: uppercase;
      width: 100%;
    }

    .expense-input {
      display: flex;
      width: 100%;
      border-radius: 3px;
      max-width: 160px;
      border: 1px solid #a7a7a7;
    }

    input {
      padding: 4px 6px;
      letter-spacing: 1.05px;
      line-height: 1;
      font-weight: 400;
      font-size: 15px;
      text-transform: capitalize;
    }

    .scroll-content {
      padding-bottom: 0 !important;
    }

    .freq-day {
      display: flex; justify-content: center; align-items: center; padding: 4px; height: 100%; width: 100%;
      transition: all .150s linear;
    }

    .freq-day:not(:last-child) {
      border-right: 1px solid #ddd;
    }

    .freq-day--selected {
      background: #ddd;
      transition: all .150s linear;
    }

    .freq-day:hover {
      background: #eee;
      transition: all .150s linear;
    }

    .disabled-button {
      opacity: 50%;
    }
  `],
  template: `
  <ion-content [scrollY]="true" [scrollX]="false">
    <div class="content-container" style="height: auto;">
      <div style="display: flex; flex-direction: column; justify-content: flex-start; align-items: center; width: 100%; height: 100%; max-height: 550px !important;">
        <div class="main-display">
          <div class="header-container header-container__budget">
            <h4 class="header-content" style="line-height: 17px;">{{ viewDate | calendarDate:(view + 'ViewTitle'):'en' }}</h4>
            <div class="btn-group">
              <div
                class="button__action"
                style="border-radius: 5px 0px 0px 5px;"
                mwlCalendarPreviousView
                [view]="view"
                [(viewDate)]="viewDate"
                (viewDateChange)="closeOpenMonthViewDay()">
                <i class="zi-cheveron-left"></i>
              </div>
              <div
                class="button__title"
                mwlCalendarToday
                (click)="updateSelectedDate()"
                [(viewDate)]="viewDate">
                Today
              </div>
              <div
                class="button__action"
                style="border-radius: 0px 5px 5px 0px;"
                mwlCalendarNextView
                [view]="view"
                [(viewDate)]="viewDate"
                (viewDateChange)="closeOpenMonthViewDay()">
                <i class="zi-cheveron-right"></i>
              </div>
            </div>
          </div>
          <mwl-calendar-month-view
            style="width: 100%;"
            [viewDate]="viewDate"
            [events]="display_expense"
            [refresh]="refresh"
            [activeDayIsOpen]="activeDayIsOpen"
            (dayClicked)="dayClicked($event.day)"
            (beforeViewRender)="updateCalendarEvents($event)"
            (eventClicked)="handleEvent('Clicked', $event)">
          </mwl-calendar-month-view>

          <div style="display: flex; flex-direction: column; width: 100%; height: 100%;">
            <div class="input-container" style="padding-top: 4px; flex-direction: row;">
              <div class="label-container">
                <span class="input-label">Name</span>
                <input class="expense-input" type="text" [(ngModel)]="cloned_expense[0].title"/>
              </div>
              <div class="label-container">
                <span class="input-label">Amount</span>
                <input class="expense-input" style="max-width: 120px;" type="text" [ngModel]="cloned_expense[0].amount | currency:'USD':'symbol' : '1.0'" [ngModelOptions]="{updateOn:'blur'}" (ngModelChange)="cloned_expense[0].amount=cleanPipe($event)"/>
              </div>
            </div>

            <div class="input-container" style="padding-top: 0px;">
              <div class="label-container">
                <span class="input-label">Category</span>
                <select class="budget-dropdown" [(ngModel)]="cloned_expense[0].category">
                  <option *ngFor="let category of budget_categories" [ngValue]="category.category_name">{{category.category_name}}</option>
                </select>
              </div>
            </div>
            <div class="input-container" style="justify-content: flex-start;">
              <div class="label-container" style="margin-right: 8px;">
                <span class="input-label">Reccuring</span>
                <select class="budget-dropdown" [(ngModel)]="cloned_expense[0].recurring_expense" (ngModelChange)="handleExpenseRecurring($event)">
                  <option [ngValue]="true">true</option>
                  <option [ngValue]="false">false</option>
                </select>
              </div>
              <div class="label-container" style="margin-right: 8px;" *ngIf="cloned_expense[0].recurring_expense">
                <span class="input-label">How Often</span>
                <select class="budget-dropdown" [(ngModel)]="cloned_expense[0].rrule.freq" (ngModelChange)="handleFrequency($event)">
                  <option [ngValue]="null"></option>
                  <option [ngValue]="Frequency.YEARLY">Yearly</option>
                  <option [ngValue]="Frequency.MONTHLY">Monthly</option>
                  <option [ngValue]="Frequency.WEEKLY">Weekly</option>
                  <option [ngValue]="Frequency.DAILY">Daily</option>
                </select>
              </div>
            </div>

            <div class="input-container" *ngIf="selected_byweekday" style="padding: 0px; margin-top: 4px; justify-content: flex-start; border: 1px solid #ddd;">
              <div class="freq-day" [ngClass]="{'freq-day--selected': selected_byweekday.weekday === 0}">Mon</div>
              <div class="freq-day" [ngClass]="{'freq-day--selected': selected_byweekday.weekday === 1}">Tue</div>
              <div class="freq-day" [ngClass]="{'freq-day--selected': selected_byweekday.weekday === 2}">Wed</div>
              <div class="freq-day" [ngClass]="{'freq-day--selected': selected_byweekday.weekday === 3}">Thu</div>
              <div class="freq-day" [ngClass]="{'freq-day--selected': selected_byweekday.weekday === 4}">Fri</div>
              <div class="freq-day" [ngClass]="{'freq-day--selected': selected_byweekday.weekday === 5}">Sat</div>
              <div class="freq-day" [ngClass]="{'freq-day--selected': selected_byweekday.weekday === 6}">Sun</div>
            </div>

            <div class="button-container">
              <div class="modal-button--remove" (click)="remove()">Remove</div>
              <div class="modal-button--cancel" (click)="cancel()">Cancel</div>
              <div class="modal-button--update" (click)="update()" [ngClass]="{'disabled-button': !canUpdateExpense()}">Update</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ion-content>
`
})
export class UpdateExpenseModalComponent implements OnInit, OnDestroy {
  @Input() expense: Expense[];
  public cloned_expense: Expense[];
  public view: CalendarView = CalendarView.Month;
  public budget_categories: BudgetCategory[]
  public CalendarView = CalendarView;
  public viewDate: Date = new Date();
  public activeDayIsOpen: boolean = true;
  public Frequency = Frequency;
  public RRule = RRule;
  public length_of_expense: number;
  public selected_byweekday: Weekday;
  public display_expense: Expense[] = [] as Expense[];
  public viewPeriod: CalendarViewPeriod;
  public viewRender: | CalendarMonthViewBeforeRenderEvent | CalendarWeekViewBeforeRenderEvent | CalendarDayViewBeforeRenderEvent;

  private user_id: string;
  private destroy$ = new Subject<void>();
  constructor(private Store: Store<AppState>, private NgbActiveModal: NgbActiveModal, private ChangeDetectorRef: ChangeDetectorRef, private FirebaseService: FirebaseService) {}

  ngOnInit() {
    this.cloned_expense = cloneDeep(this.expense);
    this.viewDate = this.cloned_expense[0].start;
    this.display_expense = cloneDeep([this.cloned_expense[0]]);
    this.Store.select((budgetStateSelectors.getBudgetCategories))
      .pipe(takeUntil(this.destroy$))
      .subscribe((budget_categories: BudgetCategory[]) => this.budget_categories = budget_categories);

    this.Store.select(UserSelectors.getUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user_id: string) => this.user_id = user_id);

    if(this.viewRender) {
      this.updateDisplayedReccuringCalendarEvents(this.viewDate);
    }

    this.ChangeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  handleEvent(_action: string, event: {event: CalendarEvent, sourceEvent: MouseEvent}) {}


  updateCalendarEvents(viewRender: | CalendarMonthViewBeforeRenderEvent | CalendarWeekViewBeforeRenderEvent | CalendarDayViewBeforeRenderEvent) {
    if (this.cloned_expense && (!this.viewPeriod || !moment(this.viewPeriod.start).isSame(viewRender.period.start) || !moment(this.viewPeriod.end).isSame(viewRender.period.end))) {
      this.viewPeriod = viewRender.period;
      this.viewRender = viewRender;
      this.display_expense = [];

      this.cloned_expense.forEach((expense: Expense) => {
        const recurring = expense.recurring_expense;

        const rule: RRule = new RRule({
          ...expense.rrule,

          // need to find a solution to update where the expense starts when click happens
          dtstart: recurring ? moment(this.viewRender.period.start).startOf('day').toDate() : moment(this.viewDate).startOf('day').toDate(),
          until: moment(viewRender.period.end).endOf('day').toDate(),
        });

        rule.all().forEach((date) => (this.display_expense.push({...expense, start: moment(date).toDate()})));
      });
    }
    this.ChangeDetectorRef.detectChanges();
  }

  updateDisplayedReccuringCalendarEvents(clicked_date: Date) {
    this.viewPeriod = this.viewRender.period;
    this.display_expense = [];

    this.cloned_expense.forEach((expense: Expense) => {
      const recurring = expense.recurring_expense;
      const rule: RRule = new RRule({
        ...expense.rrule,
        dtstart: recurring ? moment(this.viewRender.period.start).startOf('day').toDate() : moment(clicked_date).startOf('day').toDate(),
        until: moment(this.viewRender.period.end).endOf('day').toDate(),
      });

      rule.all().forEach((date) => (this.display_expense.push({...expense, start: moment(date).toDate()})));
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }) {
    if (isSameMonth(date, this.viewDate)) {
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;

      this.cloned_expense = this.cloned_expense.map((expense: Expense) => ({...expense, start: date}));
      this.handleFrequencyOnClick(date);
      this.updateDisplayedReccuringCalendarEvents(date);
    }
  }

  handleExpenseRecurring(recurring: boolean) {
    if (recurring) {
      this.cloned_expense = this.cloned_expense.map((expense: Expense) => ({...expense, rrule: {freq: RRule.WEEKLY, byweekday: this.getByWeekDay(this.viewDate.getDay())}}))
    } else {
      this.cloned_expense = this.cloned_expense.map((expense: Expense) => ({...expense, rrule: null }));
    }

    this.updateDisplayedReccuringCalendarEvents(this.viewDate);
  }

  handleFrequency(frequency: Frequency) {
    switch (frequency) {
      case Frequency.MONTHLY:
        this.cloned_expense = this.cloned_expense.map((expense: Expense) => ({...expense, rrule: {freq: Frequency.MONTHLY, bymonthday: this.viewDate.getDate()}}))
      break

      case Frequency.WEEKLY:
        this.cloned_expense = this.cloned_expense.map((expense: Expense) => ({...expense, rrule: {freq: Frequency.WEEKLY, byweekday: this.getByWeekDay(this.viewDate.getDay())}}))
      break

      case Frequency.YEARLY:
        this.cloned_expense = this.cloned_expense.map((expense: Expense) => ({...expense, rrule: {freq: Frequency.YEARLY, bymonth: this.viewDate.getDate()}}))
      break

      case Frequency.DAILY:
        this.cloned_expense = this.cloned_expense.map((expense: Expense) => ({...expense, rrule: {freq: Frequency.DAILY}}))
      break
    }

    this.updateDisplayedReccuringCalendarEvents(this.viewDate);
  }

  handleFrequencyOnClick(clicked_date: Date) {

    if (this.cloned_expense[0].recurring_expense) {
      const frequency = this.cloned_expense[0].rrule.freq;

      switch (frequency) {
        case Frequency.MONTHLY:
          this.cloned_expense = this.cloned_expense.map((expense: Expense) => ({...expense, rrule: {freq: Frequency.MONTHLY, bymonthday: clicked_date.getDate()}}))
        break

        case Frequency.WEEKLY:
          this.cloned_expense = this.cloned_expense.map((expense: Expense) => ({...expense, rrule: {freq: Frequency.WEEKLY, byweekday: this.getByWeekDay(clicked_date.getDay())}}))
        break

        case Frequency.YEARLY:
          this.cloned_expense = this.cloned_expense.map((expense: Expense) => ({...expense, rrule: {freq: Frequency.YEARLY, bymonth: clicked_date.getDate()}}))
        break
      }
    }

    this.updateDisplayedReccuringCalendarEvents(this.viewDate);
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  cancel() {
    this.NgbActiveModal.dismiss();
  }

  getByWeekDay(weekday: number) {
    switch(weekday) {
      case 0:
        return [RRule.SU];
      case 1:
        return [RRule.MO];
      case 2:
        return [RRule.TU];
      case 3:
        return [RRule.WE];
      case 4:
        return [RRule.TH];
      case 5:
        return [RRule.FR];
      case 6:
        return [RRule.SA];
    }
  }


  update() {
    const can_update = this.canUpdateExpense();

    if (can_update) {
      const updated_expense = {...this.cloned_expense[0]};
      this.FirebaseService.updateExpense(updated_expense, this.user_id);
      this.Store.dispatch(new updateExpense(updated_expense));
      this.NgbActiveModal.close();
    }
  }

  remove() {
    this.FirebaseService.removeExpense(this.cloned_expense[0], this.user_id);
    this.Store.dispatch(new removeExpense(this.cloned_expense[0]));
    this.NgbActiveModal.close();
  }

  canUpdateExpense() {
    return !!this.cloned_expense[0].amount && !!this.cloned_expense[0].title.length && !!this.cloned_expense[0].category.length;
  }

  cleanPipe(amount: string) {
    return parseInt(amount.toString().replace(/[^0-9]/, '' ), 10);
  }
}