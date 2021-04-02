import { NgModule } from '@angular/core';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { NavigationToolbarComponent } from './home/navigation-toolbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { StoreModule, ActionReducerMap } from '@ngrx/store';
import { reducerToken, REDUCERS } from './store/reducers';

const CircleDefaults = {
  'backgroundColor': '#ffffff',
  'backgroundGradientStopColor': '#c0c0c0',
  'backgroundPadding': -10,
  'radius': 60,
  'maxPercent': 100,
  'outerStrokeWidth': 10,
  'outerStrokeColor': '#61A9DC',
  'innerStrokeWidth': 0,
  'innerStrokeColor': '#effffd',
  'subtitleColor': '#444444',
  'showInnerStroke': false,
  'startFromZero': false
};

@NgModule({
  declarations: [
    NavigationToolbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    NavigationToolbarComponent
  ],
  providers: [
    AuthService
  ]
})
export class EngineModule {
  static forRoot() {
    return {
      NgModule: EngineModule,
      providers: []
    }
  }
}
