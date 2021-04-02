import { Directive, ElementRef, forwardRef, HostListener, Input, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { formatNumber } from '@angular/common';
import { isNull } from 'lodash';

export const AV_NUMERIC_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NumericalPipeDirective),
  multi: true
};

@Directive({
  selector: '[numerical-pipe]',
  providers: [AV_NUMERIC_VALUE_ACCESSOR]
})
export class NumericalPipeDirective implements ControlValueAccessor {
  @Input() prefix: string = '';
  private _onChangedCallback(value: string | number) {}
  private _onTouchedCallback() {}

  constructor(private ElementRef: ElementRef, private Renderer2: Renderer2) {}

  @HostListener('change', ['$event.target.value'])
  onChange(input: string | number) {
    this.writeValue(input);
  }

  registerOnTouched(fn: any): void {
    this._onTouchedCallback = fn;
  }

  registerOnChange(fn: any): void {
    this._onChangedCallback = fn;
  }

  writeValue(input: string | number) {
    this._onChangedCallback(input);
    const amount = !isNull(input) ? input.toString().replace(/[^0-9]/, '' ) : '';
    this.Renderer2.setProperty(this.ElementRef.nativeElement, 'value', `${this.prefix}${amount}`);
  }
}