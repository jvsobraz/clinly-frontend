import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: [`
    :host { display: block; height: 100%; }
  `],
})
export class App implements OnInit {
  private lang = inject(LanguageService);

  ngOnInit() {
    this.lang.init();
  }
}
