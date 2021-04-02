import { ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { isSameDay, isSameMonth } from 'date-fns';
import { Observable, Subject } from 'rxjs';
import { CalendarDayViewBeforeRenderEvent, CalendarEvent, CalendarMonthViewBeforeRenderEvent, CalendarView, CalendarViewPeriod, CalendarWeekViewBeforeRenderEvent } from 'angular-calendar';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { budgetStateSelectors } from '../store/budget/budget.selector';
import { Expense } from '../store/budget/budget.model';
import { updateDisplayedExpenses, updateSelectedCalendarDate } from '../store/budget/budget.actions';
import RRule from 'rrule';
import * as moment from 'moment';
import { cloneDeep, flatten } from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { AddExpenseModalComponent } from '../modals/add-calendar-expense-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'budget-overview',
  encapsulation: ViewEncapsulation.None,
  styles: [``],
  template: `
    <ion-content [scrollY]="false" [scrollX]="false">
      <div class="content-container" style="height: 100vh; width: 100vw; position: relative;">
        <div class="main-display">
          <div class="header-container header-container__budget">
            <h4 class="header-content" style="line-height: 17px;">{{ viewDate | calendarDate:(view + 'ViewTitle'):'en' }}</h4>
            <i class="zi-add-outline add-expense--icon" (click)="openAddExpenseModal()"></i>

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
            [events]="(calendar_events)"
            [refresh]="refresh"
            [activeDayIsOpen]="activeDayIsOpen"
            (dayClicked)="dayClicked($event.day)"
            (beforeViewRender)="updateCalendarEvents($event)"
            (eventClicked)="handleEvent('Clicked', $event)">
          </mwl-calendar-month-view>

          <expenses-list class="full"></expenses-list>
          <div style="width: 100%; min-height: 50px;"></div>
        </div>
      </div>
    </ion-content>
  `
})
export class UserBudgetComponent implements OnInit, OnDestroy {
  public view: CalendarView = CalendarView.Month;
  public CalendarView = CalendarView;
  public viewDate: Date = new Date();
  public activeDayIsOpen: boolean = true;
  public refresh: Subject<any> = new Subject();
  public expenses: Expense[] = [] as Expense[];
  public calendar_events: Expense[] = [] as Expense[];
  public viewPeriod: CalendarViewPeriod;
  public viewRender: | CalendarMonthViewBeforeRenderEvent | CalendarWeekViewBeforeRenderEvent | CalendarDayViewBeforeRenderEvent;

  private destroy$ = new Subject<void>();

  constructor(private Store: Store<AppState>, private ChangeDetectorRef: ChangeDetectorRef, private NgbModal: NgbModal) {}

  ngOnInit() {
    this.Store.select(budgetStateSelectors.getExpenses)
      .pipe(takeUntil(this.destroy$))
      .subscribe((expenses: Expense[]) => {
        this.expenses = cloneDeep(expenses)

        if(this.viewRender) {
          this.updateDisplayedCalendarEvents();
        }
      });

    this.ChangeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  updateCalendarEvents(viewRender: | CalendarMonthViewBeforeRenderEvent | CalendarWeekViewBeforeRenderEvent | CalendarDayViewBeforeRenderEvent) {
    if (this.expenses.length !== 0 && (!this.viewPeriod || !moment(this.viewPeriod.start).isSame(viewRender.period.start) || !moment(this.viewPeriod.end).isSame(viewRender.period.end))) {
      this.viewPeriod = viewRender.period;
      this.viewRender = viewRender;
      this.calendar_events = [];

      const static_expenses = this.expenses.filter((expense: Expense) => !expense.recurring_expense && isSameMonth(expense.start, this.viewDate));
      const filtered_expenses = this.expenses.filter((expense: Expense) => expense.recurring_expense);
      const recurring_expenses = filtered_expenses.map((recurring_expense: Expense) => {
        const rule: RRule = new RRule({
          ...recurring_expense.rrule,
          dtstart: moment(viewRender.period.start).startOf("day").toDate(),
          until: moment(viewRender.period.end).endOf("day").toDate()
        });

        const rules = rule.all().map((date) => {
          return {...recurring_expense, start: moment(date).toDate()} as Expense;
        });

        return rules;
      });

      this.calendar_events = static_expenses.concat(flatten(recurring_expenses));
      this.Store.dispatch(new updateDisplayedExpenses(this.calendar_events));
    }

    this.ChangeDetectorRef.detectChanges();
  }

  updateDisplayedCalendarEvents() {
    this.calendar_events = [];
    const static_expenses = this.expenses.filter((expense: Expense) => !expense.recurring_expense && isSameMonth(expense.start, this.viewDate));
    const filtered_expenses = this.expenses.filter((expense: Expense) => expense.recurring_expense);
    const recurring_expenses = filtered_expenses.map((recurring_expense: Expense) => {
      const rule: RRule = new RRule({
        ...recurring_expense.rrule,
        dtstart: moment(this.viewRender.period.start).startOf("day").toDate(),
        until: moment(this.viewRender.period.end).endOf("day").toDate()
      });

      const rules = rule.all().map((date) => {
        return {...recurring_expense, start: moment(date).toDate()} as Expense;
      });

      return rules;
    });

    this.calendar_events = static_expenses.concat(flatten(recurring_expenses));
    this.Store.dispatch(new updateDisplayedExpenses(this.calendar_events));
  }

  handleEvent(_action: string, event: {event: CalendarEvent, sourceEvent: MouseEvent}) {
    this.Store.dispatch(new updateSelectedCalendarDate(event.event.start));
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }) {
    this.Store.dispatch(new updateSelectedCalendarDate(date));
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  updateSelectedDate() {
    this.Store.dispatch(new updateSelectedCalendarDate(new Date()));
  }

  openAddExpenseModal() {
    const modalRef = this.NgbModal.open(AddExpenseModalComponent, {windowClass: 'calendar-modal'});
    modalRef.componentInstance.dateOnOpen = this.viewDate;
    modalRef.result.then(() => this.updateDisplayedCalendarEvents());
  }
}