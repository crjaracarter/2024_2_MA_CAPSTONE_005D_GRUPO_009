import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogService } from '../../../../services/blog/blog.service';
import { Router } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule, AsyncPipe, NgClass } from '@angular/common';
import * as AOS from 'aos';
import { trigger, transition, style, animate } from '@angular/animations';
import { BlogPost } from '../../../../core/interfaces/blog/blog-post.interface';
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
  selector: 'app-blog-create',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
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
  templateUrl: './blog-create.component.html',
  styleUrl: './blog-create.component.scss',
})
export class BlogCreateComponent implements OnInit {
  blogForm!: FormGroup;
  isLoading = false;
  coverImage: File | null = null;
  tags: string[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA];


  tinyMceConfig = {
    height: 500,
    menubar: true,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount',
    ],
    toolbar:
      'undo redo | formatselect | bold italic backcolor | \
      alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | removeformat | help',
  };

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      subtitle: [''],
      content: ['', Validators.required],
      isDraft: [true],
    });
  }

  onImageSelect(event: any) {
    const file = event.addedFiles[0];
    if (file) {
      this.coverImage = file;
      // Preview logic here
    }
  }

  addTag(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.push(value);
    }
    if (event.chipInput) {
      event.chipInput.clear();
    }
  }

  async onSubmit() {
    if (this.blogForm.valid) {
      this.isLoading = true;
      try {
        const formData = this.blogForm.value;
        const post = {
          ...formData,
          tags: this.tags,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (this.coverImage) {
          const imageUrl = await this.blogService.uploadImage(this.coverImage);
          post.imageUrl = imageUrl;
        }

        await this.blogService.createPost(post);
        this.router.navigate(['/dashboard/blog']);
      } catch (error) {
        console.error('Error creating post:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  
}
