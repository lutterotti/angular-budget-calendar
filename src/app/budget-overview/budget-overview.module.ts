import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { BudgetOverviewComponent } from './budget-overview.component';
import { EngineModule } from '../engine.module';
import { WingmenModule } from '../wingmen/wingmen.module';
import { HorizontalBarGraphComponent } from '../wingmen/horizontal-bar-graph.component';
import { EditBudgetCategoriesModalComponent } from '../modals/edit-budget-categories-modal.component';
import { ModalModule } from '../modals/modal.module';
import { AddBudgetCategoryComponent } from '../modals/add-budget-category-modal.component';

@NgModule({
  imports: [
    CommonModule,
    EngineModule,
    WingmenModule,
    ModalModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: BudgetOverviewComponent
      }
    ])
  ],
  entryComponents: [
    HorizontalBarGraphComponent,
    EditBudgetCategoriesModalComponent,
    AddBudgetCategoryComponent
  ],
  declarations: [
    BudgetOverviewComponent,
  ]
})
export class BudgetOverviewModule {}
