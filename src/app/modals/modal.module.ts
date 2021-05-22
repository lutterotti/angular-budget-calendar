import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EngineModule } from '../engine.module';
import { CalendarModule, DateAdapter, CalendarNativeDateFormatter, DateFormatterParams, CalendarDateFormatter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import * as moment from 'moment';
import { UpdateExpenseModalComponent } from './update-calendar-expense-modal.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NumericalPipeDirective } from '../directives/numerical-pipe.directive';
import { MiniCalendarComponent } from './mini-calendar.component';
import { AddExpenseModalComponent } from './add-calendar-expense-modal.component';
import { EditBudgetModalComponent } from './edit-budget-modal.component';
import { EditBudgetCategoriesModalComponent } from './edit-budget-categories-modal.component';
import { AddBudgetCategoryComponent } from './add-budget-category-modal.component';


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
    NgbModalModule,
    FormsModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: momentAdapterFactory }),
    IonicModule,
  ],
  entryComponents: [
    UpdateExpenseModalComponent,
    AddExpenseModalComponent,
    EditBudgetModalComponent,
    MiniCalendarComponent,
    EditBudgetCategoriesModalComponent,
    AddBudgetCategoryComponent
  ],
  declarations: [
    UpdateExpenseModalComponent,
    AddExpenseModalComponent,
    EditBudgetModalComponent,
    MiniCalendarComponent,
    NumericalPipeDirective,
    EditBudgetCategoriesModalComponent,
    AddBudgetCategoryComponent
  ],
  exports: [
    UpdateExpenseModalComponent,
    EditBudgetModalComponent,
    MiniCalendarComponent,
    EditBudgetCategoriesModalComponent,
    AddBudgetCategoryComponent
  ],
  providers: [
    {provide: CalendarDateFormatter, useClass: CustomDateFormatter}
  ]
})
export class ModalModule {}
