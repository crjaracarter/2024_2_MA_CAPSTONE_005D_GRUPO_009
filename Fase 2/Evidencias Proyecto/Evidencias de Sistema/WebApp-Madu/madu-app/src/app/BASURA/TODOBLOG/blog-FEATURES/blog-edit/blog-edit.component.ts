import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { BlogService } from '../../../../services/blog/blog.service';
import { BlogPost } from '../../../../core/interfaces/blog/blog-post.interface';
import { UserService } from '../../../../services/user/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipInputEvent } from '@angular/material/chips';
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


@Component({
  selector: 'app-blog-edit',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ],
  templateUrl: './blog-edit.component.html',
  styleUrl: './blog-edit.component.scss'
})
export class BlogEditComponent implements OnInit {
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  blogForm: FormGroup = new FormGroup({});
  isLoading = false;
  isSaving = false;
  originalPost: BlogPost | null = null;
  coverImage: File | null = null;
  currentImageUrl: string = '';
  tags: string[] = [];
  
  editorConfig = {
    height: 500,
    menubar: true,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount'
    ],
    toolbar: 'undo redo | formatselect | bold italic backcolor | \
      alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | removeformat | help'
  };

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  private initForm() {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      subtitle: [''],
      content: ['', Validators.required],
      status: ['draft'],
      imageUrl: ['']
    });
  }

  async ngOnInit() {
    this.isLoading = true;
    try {
      const postId = this.route.snapshot.paramMap.get('id');
      if (postId) {
        const post = await this.blogService.getPostById(postId);
        if (post) {
          this.originalPost = post;
          this.currentImageUrl = post.imageUrl || '';
          this.tags = [...(post.tags || [])];
          this.populateForm(post);
        }
      }
    } catch (error) {
      this.snackBar.open('Error al cargar el post', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  private populateForm(post: BlogPost) {
    this.blogForm.patchValue({
      title: post.title,
      subtitle: post.subtitle || '',
      content: post.content,
      status: post.status,
      imageUrl: post.imageUrl
    });
  }

  onImageDrop(event: any) {
    const file = event.addedFiles[0];
    if (file) {
      // Validar tipo y tamaño de archivo
      if (this.validateFile(file)) {
        this.coverImage = file;
        // Crear preview
        const reader = new FileReader();
        reader.onload = () => {
          this.currentImageUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  private validateFile(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      this.snackBar.open('Solo se permiten imágenes JPG, PNG y WebP', 'Cerrar', {
        duration: 3000
      });
      return false;
    }
    
    if (file.size > maxSize) {
      this.snackBar.open('La imagen no debe superar 5MB', 'Cerrar', {
        duration: 3000
      });
      return false;
    }
    
    return true;
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  async onSubmit() {
    if (this.blogForm.valid && this.originalPost?.id) {
      this.isSaving = true;
      try {
        const formData = this.blogForm.value;
        let imageUrl = this.currentImageUrl;

        // Si hay una nueva imagen, súbela
        if (this.coverImage) {
          imageUrl = await this.blogService.uploadImage(this.coverImage);
        }

        const updatedPost: BlogPost = {
          ...this.originalPost,
          ...formData,
          imageUrl,
          tags: this.tags,
          updatedAt: new Date()
        };

        await this.blogService.updatePost(updatedPost);
        
        this.snackBar.open('Post actualizado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        this.router.navigate(['/dashboard/blog']);
      } catch (error) {
        this.snackBar.open('Error al actualizar el post', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      } finally {
        this.isSaving = false;
      }
    }
  }

  confirmCancel() {
    const hasChanges = this.checkForChanges();
    if (hasChanges) {
      if (confirm('¿Estás seguro de que deseas descartar los cambios?')) {
        this.router.navigate(['/dashboard/blog']);
      }
    } else {
      this.router.navigate(['/dashboard/blog']);
    }
  }

  private checkForChanges(): boolean {
    if (!this.originalPost) return false;
    
    const currentValue = this.blogForm.value;
    return (
      currentValue.title !== this.originalPost.title ||
      currentValue.subtitle !== this.originalPost.subtitle ||
      currentValue.content !== this.originalPost.content ||
      currentValue.status !== this.originalPost.status ||
      this.coverImage !== null ||
      JSON.stringify(this.tags) !== JSON.stringify(this.originalPost.tags)
    );
  }
}
