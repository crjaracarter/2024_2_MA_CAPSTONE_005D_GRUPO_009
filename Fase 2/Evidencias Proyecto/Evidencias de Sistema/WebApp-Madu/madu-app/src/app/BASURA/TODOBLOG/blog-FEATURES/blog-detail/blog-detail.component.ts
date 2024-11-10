import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../../../services/blog/blog.service';
import { BlogPost } from '../../../../core/interfaces/blog/blog-post.interface';
import { Location } from '@angular/common';
import { UserService } from '../../../../services/user/user.service';
import { StripHtmlPipe } from '../../../../shared/pipes/strip-html.pipe';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';


import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule, AsyncPipe, NgClass } from '@angular/common';
import * as AOS from 'aos';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { NgModule } from '@angular/core';


import { MatChipInputEvent } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { EditorModule } from '@tinymce/tinymce-angular';
import { MatIconModule } from '@angular/material/icon';

import { ReactiveFormsModule } from '@angular/forms';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipInput } from '@angular/material/chips';

import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-blog-detail',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
  // imports: [
  //   CommonModule,
  //   MatSlideToggleModule,
  //   MatChipsModule,
  //   NgxDropzoneModule,
  //   EditorModule,
  //   MatIconModule,
  //   MatProgressBarModule,
  //   ReactiveFormsModule,
  //   MatChipInput,

  // ],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss',
})
export class BlogDetailComponent implements OnInit {
  post: BlogPost | null = null;
  isLoading = true;
  error: string | null = null;
  authorData: any = null;
  isAdmin = false;
  relatedPosts: BlogPost[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private userService: UserService,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadPost();
    this.checkAdminStatus();
  }

  private async loadPost() {
    try {
      const postId = this.route.snapshot.paramMap.get('id');
      if (!postId) {
        throw new Error('Post ID not found');
      }

      this.post = await this.blogService.getPostById(postId);

      if (this.post) {
        // Cargar datos del autor
        this.authorData = await this.userService.getUserById(
          this.post.authorId
        );

        // Cargar posts relacionados basados en tags
        this.loadRelatedPosts();
      }
    } catch (error) {
      console.error('Error loading post:', error);
      this.error = 'No se pudo cargar la entrada del blog';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadRelatedPosts() {
    if (this.post?.tags) {
      this.relatedPosts = await this.blogService.getRelatedPosts(
        this.post.id!,
        this.post.tags,
        3
      );
    }
  }

  private async checkAdminStatus() {
    this.isAdmin = await this.userService.hasAdminRole();
  }

  goBack() {
    this.location.back();
  }

  async deletePost() {
    if (!this.post?.id) return;

    if (confirm('¿Estás seguro de que deseas eliminar esta entrada?')) {
      try {
        await this.blogService.deletePost(this.post.id);
        this.router.navigate(['/dashboard/blog']);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  }

  sharePost(platform: 'twitter' | 'facebook' | 'linkedin') {
    const url = window.location.href;
    const title = this.post?.title;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
        break;
    }

    window.open(shareUrl, '_blank');
  }
}
