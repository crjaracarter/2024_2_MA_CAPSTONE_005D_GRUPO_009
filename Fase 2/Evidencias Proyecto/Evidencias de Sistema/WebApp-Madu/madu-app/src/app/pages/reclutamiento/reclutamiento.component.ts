import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { loadFull } from 'tsparticles';
import type {
  Container,
  Engine,
  ISourceOptions,
  RecursivePartial,
} from 'tsparticles-engine';
import { MoveDirection } from 'tsparticles-engine';
import * as AOS from 'aos';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CommonModule } from '@angular/common';
import { NgParticlesModule } from 'ng-particles';
import { RouterLink } from '@angular/router';
import { Route } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, NgParticlesModule, RouterLink],
  selector: 'app-reclutamiento',
  templateUrl: './reclutamiento.component.html',
  styleUrls: ['./reclutamiento.component.scss'],
})
export class ReclutamientoComponent implements OnInit, AfterViewInit {
  // Opciones para las partículas
  id = 'tsparticles';

  @HostListener('window:scroll', [])
  onScroll() {
    AOS.refresh();
  }

  /* Particulas config */
  particlesConfig: ISourceOptions = {
    fullScreen: { enable: false },
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 120,
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: '#C2AFFF',
      },
      opacity: {
        value: 0.5,
      },
      size: {
        value: 3,
      },
      links: {
        enable: true,
        distance: 150,
        color: '#C2AFFF',
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 2,
        direction: 'none',
        random: true,
        straight: false,
        outModes: {
          default: 'bounce',
        },
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab',
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 1,
          },
        },
      },
    },
    detectRetina: true,
  };

  constructor() {
    gsap.registerPlugin(ScrollTrigger);
  }

  async ngOnInit() {
    // Initialize AOS with custom settings
    AOS.init({
      duration: 1000,
      once: false,
      mirror: false,
      offset: 100,
      easing: 'ease-out-cubic',
    });
  }

  ngAfterViewInit() {
    // Mueve el refresh aquí
    setTimeout(() => {
      AOS.refresh();
      this.initAnimations();
    }, 100);
  }

  private initAnimations() {
    // Verificar si los elementos existen antes de animar
    const heroContent = document.querySelector('.hero-content');
    const heroSection = document.querySelector('.hero-section');
    const processPoints = document.querySelectorAll('.process-point');
    const featureCards = document.querySelectorAll('.feature-card');

    // Animación del hero section
    if (heroContent && heroSection) {
      gsap.to(heroContent, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // Animación de los puntos del proceso
    if (processPoints.length > 0) {
      processPoints.forEach((point) => {
        gsap.from(point, {
          scale: 0,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: point,
            start: 'top center+=100',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }

    // Animación adicional para las feature cards
    if (featureCards.length > 0) {
      featureCards.forEach((card, index) => {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          delay: index * 0.2,
          scrollTrigger: {
            trigger: card,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }
  }

  // Método de inicialización para ng-particles
  async particlesInit(engine: Engine): Promise<void> {
    try {
      await loadFull(engine);
    } catch (error) {
      console.error('Error initializing particles:', error);
    }
  }

  particlesLoaded(container: Container): void {
    console.log('Particles cargadas', container);
  }
}
