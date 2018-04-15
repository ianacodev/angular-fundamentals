// decorator a function that annotates a specific function
// use it against a typescript class
import { Component } from '@angular/core';

// holds meta data.
@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  template: `
    <div class="app">
      {{title}}
    </div>
  ` // properties in class available here, called interpolation.
})
export class AppComponent {
  private title: string;
  constructor() {
    this.title = 'Ultimate Angular';
  }
}
