import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Projeto } from '../../../features/projects/services/project.service';
import { ProjectCardComponent } from '../project-card/project-card.component';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnChanges, AfterViewInit {
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



