import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appPlaceholder]' // [] here means attribute instead of the array
})
export class PlaceholderDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
