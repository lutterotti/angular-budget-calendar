import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'horizontal-bar-graph',
  styles: [`
    .bar-background {
      display: flex;
      position: relative;
      overflow: hidden;
      width: 100%;
    }

    .bar-amount {
      display: flex;
      position: absolute;
      width: 100%;
      height: 100%;
      right: 0px;
      animation-duration: 3s;
      animation-name: slide;
      animation-iteration-count: 1;
      transition: right 1.0s linear;
    }
  `],
  template: `
    <div class="bar-background" #barBackground [ngStyle]="{'height': getStyleHeight(), 'background': backgroundColour}">
      <div class="bar-amount" [ngStyle]="{'background': amountColour, 'right': amount_position}"></div>
    </div>
  `
})
export class HorizontalBarGraphComponent implements AfterViewInit {
  @ViewChild('barBackground', { static: false }) barBackground: ElementRef;
  @Input() height: number = 15;
  @Input() amountColour: string = '#52e3d0';
  @Input() backgroundColour: string = '#eee'
  @Input() currentAmount: number = 50;
  @Input() min: number = 1;
  @Input() max: number = 100;

  public bar_width: number = 0;
  public pixel_value: number = 0;
  public pixel_amount: number = 0;
  public amount_position: string = '0px';

  constructor(private ChangeDetectorRef: ChangeDetectorRef) {}

  ngAfterViewInit() {

    // maybe use mutationObserver instaed in the future??
    setTimeout(() => {
      this.bar_width = this.barBackground.nativeElement.offsetWidth;
      this.pixel_value = (this.max / this.min) / this.bar_width;
      this.pixel_amount = (this.currentAmount - this.min) / this.pixel_value;
      this.amount_position = this.generateAmountPosition()
    }, 500);

    this.ChangeDetectorRef.detectChanges();
  }

  getStyleHeight() {
    return `${this.height}px`;
  }

  generateAmountPosition() {
    if (this.pixel_amount > this.bar_width) {
      return `0px`;
    } else if (this.pixel_amount <= 0) {
      return `${this.bar_width}px`;
    } else {
      return `${this.bar_width - this.pixel_amount}px`;
    }
  }
}