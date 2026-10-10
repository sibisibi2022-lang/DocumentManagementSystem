//app.ts ↓
// Controls the behavior/logic of the main Angular component
// app.html ↓
// Controls what appears on the screen
// app.css ↓
// Controls the stylingfor component logic
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('docuvault-frontend');
}
