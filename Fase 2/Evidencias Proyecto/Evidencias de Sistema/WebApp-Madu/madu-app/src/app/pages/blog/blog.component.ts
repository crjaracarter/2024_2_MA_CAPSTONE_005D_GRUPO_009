// blog.component.ts
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

// Extra libraries for enhanced visuals
import { NgParticlesModule } from 'ng-particles';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  date: Date;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  tags: string[];
  likes: number;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    NgParticlesModule
  ],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class BlogComponent implements OnInit {
  featuredPost!: BlogPost;
  blogPosts: BlogPost[] = [];
  categories: string[] = [
    'Recursos Humanos', 
    'Liderazgo', 
    'Cultura Organizacional', 
    'Desarrollo Profesional', 
    'Productividad',
    'Tecnología RH',
    'Bienestar Laboral'
  ];
  selectedCategory: string = 'Todos';
  particlesOptions = {
    particles: {
      color: {
        value: '#5A4FCF'
      },
      links: {
        color: '#8A8EF2',
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1
      },
      move: {
        enable: true,
        speed: 2
      },
      number: {
        value: 30
      },
      opacity: {
        value: 0.3
      }
    }
  };

  constructor() {
    this.initializeBlogPosts();
  }

  ngOnInit(): void {
    this.featuredPost = this.blogPosts[0];
    this.initializeAnimations();
  }

  private initializeAnimations(): void {
    gsap.from('.blog-card', {
      scrollTrigger: {
        trigger: '.blog-grid',
        start: 'top center',
        toggleActions: 'play none none reverse'
      },
      y: 60,
      opacity: 0,
      duration: 0.6,
      stagger: 0.2
    });
  }

  private initializeBlogPosts() {
    this.blogPosts = [
      {
        id: 1,
        title: 'Transformación Digital en RRHH: Guía Completa para PYMES',
        excerpt: 'Descubre cómo la tecnología está revolucionando la gestión del talento y cómo tu empresa puede adaptarse a estos cambios.',
        category: 'Tecnología RH',
        readTime: '7 min',
        image: 'assets/img/blog/digital-transform.svg',
        date: new Date('2024-03-20'),
        author: {
          name: 'María González',
          avatar: 'assets/img/blog/maria.svg',
          role: 'Especialista en HR Tech'
        },
        tags: ['Digitalización', 'RRHH', 'Innovación'],
        likes: 245
      },
      {
        id: 2,
        title: 'Bienestar Laboral: La Clave para Retener Talento',
        excerpt: 'Estrategias prácticas para crear un ambiente de trabajo saludable y mantener a tus empleados motivados.',
        category: 'Bienestar Laboral',
        readTime: '5 min',
        image: 'assets/img/blog/wellbeing.svg',
        date: new Date('2024-03-18'),
        author: {
          name: 'Carlos Ruiz',
          avatar: 'assets/img/blog/carlos.svg',
          role: 'Psicólogo Organizacional'
        },
        tags: ['Bienestar', 'Retención', 'Cultura'],
        likes: 189
      },
      // ... más posts
    ];
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
  }

  likePost(post: BlogPost): void {
    post.likes++;
    // Aquí iría la lógica para persistir el like
  }
}