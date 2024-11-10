import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../../../services/blog/blog.service';
import { BlogPost } from '../../../../core/interfaces/blog/blog-post.interface';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule, AsyncPipe, NgClass } from '@angular/common';
import * as AOS from 'aos';
import { StripHtmlPipe } from '../../../../shared/pipes/strip-html.pipe';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-blog-list',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(15px)' }),
            stagger(50, [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
})
export class BlogListComponent implements OnInit {
  posts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  isLoading = false;
  searchControl = new FormControl('');
  statusFilter = 'all'; // 'all' | 'published' | 'draft'
  sortOrder = 'newest'; // 'newest' | 'oldest' | 'a-z' | 'z-a'


  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.loadPosts();
    this.setupSearch();
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.filterPosts(value || '');
      });
  }

  async loadPosts() {
    this.isLoading = true;
    try {
      this.posts = await this.blogService.getPosts();
      this.filterPosts();
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      this.isLoading = false;
    }
  }

  filterPosts(searchTerm: string = '') {
    let filtered = [...this.posts];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filtrar por estado
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((post) => post.status === this.statusFilter);
    }

    // Ordenar
    switch (this.sortOrder) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'a-z':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'z-a':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    this.filteredPosts = filtered;
  }

  async deletePost(postId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta entrada?')) {
      try {
        await this.blogService.deletePost(postId);
        this.posts = this.posts.filter((post) => post.id !== postId);
        this.filterPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  }
}
