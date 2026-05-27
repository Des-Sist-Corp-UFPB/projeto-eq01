import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Projeto } from '../services/project.service';
import { ProjectCardComponent } from './project-card';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent],
  template: `
    <div class="carousel-container">
      <button class="nav-button prev" (click)="scrollLeft()" *ngIf="showControls">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="arrow-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <div class="carousel-track" #track (scroll)="onScroll()">
        <div class="carousel-item" *ngFor="let item of items">
          <app-project-card [projeto]="item"></app-project-card>
        </div>
        
        <div class="empty-state" *ngIf="items.length === 0">
          <p>Nenhum projeto encontrado nesta seção.</p>
        </div>
      </div>

      <button class="nav-button next" (click)="scrollRight()" *ngIf="showControls && !isAtEnd">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="arrow-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .carousel-container {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      margin: 16px 0 32px;
    }

    .carousel-track {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      scroll-behavior: smooth;
      width: 100%;
      padding: 10px 4px;
      scrollbar-width: none; /* Firefox */
    }

    .carousel-track::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
    }

    .carousel-item {
      flex: 0 0 300px; /* Largura fixa para cada card */
      width: 300px;
    }

    @media (max-width: 640px) {
      .carousel-item {
        flex: 0 0 260px;
        width: 260px;
      }
    }

    .nav-button {
      position: absolute;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
      z-index: 10;
    }

    .nav-button:hover {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(31, 122, 224, 0.25);
    }

    .nav-button.prev {
      left: -16px;
    }

    .nav-button.next {
      right: -16px;
    }

    .arrow-icon {
      width: 18px;
      height: 18px;
    }

    .empty-state {
      padding: 40px;
      text-align: center;
      color: var(--color-muted);
      width: 100%;
      border: 1px dashed var(--color-border);
      border-radius: var(--border-radius);
      background: white;
    }
  `]
})
export class CarouselComponent {
  @Input({ required: true }) items: Projeto[] = [];

  @ViewChild('track') track!: ElementRef<HTMLDivElement>;

  protected showControls = true;
  protected isAtEnd = false;

  ngOnChanges() {
    this.checkControls();
  }

  ngAfterViewInit() {
    setTimeout(() => this.checkControls(), 100);
  }

  checkControls() {
    this.showControls = this.items && this.items.length > 0;
  }

  onScroll() {
    if (!this.track) return;
    const el = this.track.nativeElement;
    // Se o scroll atingiu a extremidade direita
    this.isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
  }

  scrollLeft() {
    if (!this.track) return;
    this.track.nativeElement.scrollBy({ left: -320, behavior: 'smooth' });
  }

  scrollRight() {
    if (!this.track) return;
    this.track.nativeElement.scrollBy({ left: 320, behavior: 'smooth' });
  }
}
