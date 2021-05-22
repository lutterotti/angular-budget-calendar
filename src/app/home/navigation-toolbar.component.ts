import { Component } from '@angular/core';

@Component({
  selector: 'navigation-toolbar',
  styles: [``],
  template: `
    <div class="navigation-container">
      <div class="navigation" style="width: 420px;">
        <div class="icon-container" [routerLink]="['/budget-overview']" routerLinkActive="current-route"><i class="zi-dashboard navigation__icon"></i></div>
        <div class="icon-container" [routerLink]="['/budget-calendar']" routerLinkActive="current-route"><i class="zi-calendar navigation__icon"></i></div>
        <div class="icon-container" [routerLink]="['/home']" routerLinkActive="current-route"><i class="zi-home navigation__icon"></i></div>
      </div>
    </div>

  `
})
export class NavigationToolbarComponent {

  constructor() {}
}