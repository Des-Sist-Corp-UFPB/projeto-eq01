import { Component } from '@angular/core';
import { StoreComingSoonCardComponent } from '../../components/store-coming-soon-card/store-coming-soon-card.component';

@Component({
  selector: 'app-loja-page',
  standalone: true,
  imports: [StoreComingSoonCardComponent],
  templateUrl: './loja.page.html',
  styleUrl: './loja.page.css'
})
export class LojaPageComponent {}
