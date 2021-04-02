import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { Animation } from '@ionic/core'
import { SQLite } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule, ActionReducerMap } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CircleProgressOptionsInterface, NgCircleProgressModule } from 'ng-circle-progress';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { REDUCERS, reducerProvider } from './store/reducers';
import { EngineModule } from './engine.module';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { environment } from '../environment/environment';
import { AuthService } from './services/auth.service';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from './modals/modal.module';
import { FirebaseService } from './services/firebase.service';
import { FirebaseEffects } from './store/budget/firebase.effect';
import { EffectsModule } from '@ngrx/effects';
import { AuthGuard } from './services/auth.guard';
import { WingmenModule } from './wingmen/wingmen.module';

const CircleDefaults: CircleProgressOptionsInterface = {
  backgroundColor: '#ffffff',
  backgroundGradientStopColor: '#c0c0c0',
  backgroundPadding: -10,
  radius: 60,
  outerStrokeWidth: 10,
  outerStrokeColor: '#61A9DC',
  innerStrokeWidth: 5,
  innerStrokeColor: '#effffd',
  subtitleColor: '#444444',
  showInnerStroke: true,
  startFromZero: false
};

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    FormsModule,
    EngineModule,
    ModalModule,
    WingmenModule,
    BrowserAnimationsModule,
    BrowserModule,
    BsDatepickerModule.forRoot(),
    HttpClientModule,
    IonicModule.forRoot({
      backButtonText: '',
      mode: 'ios',
      scrollAssist: false,
      scrollPadding: false
    }),
    MatProgressBarModule,
    NgCircleProgressModule.forRoot(CircleDefaults),
    StoreModule.forRoot(REDUCERS as ActionReducerMap<any>, { runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true } }),
    EffectsModule.forRoot([FirebaseEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 10
    }),
    AngularFireModule.initializeApp(environment.firebase, 'fcc-finance'),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFirestoreModule
  ],
  providers: [
    reducerProvider,
    GooglePlus,
    StatusBar,
    SQLite,
    AuthService,
    AuthGuard,
    FirebaseService,
    Toast,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
