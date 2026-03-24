import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuPrincipalComponent } from './components/menu-principal/menu-principal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  imports: [RouterOutlet, MenuPrincipalComponent],
})
export class AppComponent {
  title = 'COData-Angular';
}