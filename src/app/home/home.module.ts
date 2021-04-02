import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainDisplayComponent } from './main-display.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CircleProgressOptionsInterface, NgCircleProgressModule } from 'ng-circle-progress';
import { EngineModule } from '../engine.module';
import { AuthService } from '../services/auth.service';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

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
  imports: [
    CommonModule,
    EngineModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    MatProgressBarModule,
    NgCircleProgressModule.forRoot(CircleDefaults),
    FormsModule,
    NgbModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: MainDisplayComponent
      }
    ])
  ],
  declarations: [
    MainDisplayComponent
  ],
  providers: [
    AuthService
  ]
})
export class HomePageModule {}
