import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EngineModule } from '../engine.module';
import { HorizontalBarGraphComponent } from './horizontal-bar-graph.component';

@NgModule({
  imports: [
    CommonModule,
    EngineModule,
    IonicModule
  ],
  entryComponents: [
    HorizontalBarGraphComponent
  ],
  declarations: [
    HorizontalBarGraphComponent
  ],
  exports: [
    HorizontalBarGraphComponent
  ],
  providers: []
})
export class WingmenModule {}
