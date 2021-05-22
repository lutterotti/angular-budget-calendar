import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { UserBudgetComponent } from './budget-calendar.component';
import { EngineModule } from '../engine.module';
import { CalendarModule, DateAdapter, CalendarNativeDateFormatter, DateFormatterParams, CalendarDateFormatter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import * as moment from 'moment';
import { ExpensesListComponent } from './expenses-list.component';
import { ModalModule } from '../modals/modal.module';
import { UpdateExpenseModalComponent } from '../modals/update-calendar-expense-modal.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AddExpenseModalComponent } from '../modals/add-calendar-expense-modal.component';


export function momentAdapterFactory() {
  return adapterFactory(moment);
};


export class CustomDateFormatter extends CalendarNativeDateFormatter {

  public monthViewColumnHeader({date, locale}: DateFormatterParams): string {
    return new Intl.DateTimeFormat(locale, {weekday: 'short'}).format(date);
  }
}

@NgModule({
  imports: [
    CommonModule,
    EngineModule,
    ModalModule,
    NgbModalModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: momentAdapterFactory }),
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: UserBudgetComponent
      }
    ])
  ],
  entryComponents: [
    UpdateExpenseModalComponent,
    AddExpenseModalComponent
  ],
  declarations: [
    UserBudgetComponent,
    ExpensesListComponent,
  ],
  providers: [
    {provide: CalendarDateFormatter, useClass: CustomDateFormatter}
  ]
})
export class UserBudgetModule {}
