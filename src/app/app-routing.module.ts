import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './services/auth.guard';

const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'prefix'},
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule)
  },
  {
    path: 'budget-overview',
    loadChildren: () =>
      import('./budget-overview/budget-overview.module').then(
        (m) => m.BudgetOverviewModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'budget-calendar',
    loadChildren: () =>
      import('./budget-calendar/budget-calendar.module').then(
        (m) => m.UserBudgetModule
      ),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
