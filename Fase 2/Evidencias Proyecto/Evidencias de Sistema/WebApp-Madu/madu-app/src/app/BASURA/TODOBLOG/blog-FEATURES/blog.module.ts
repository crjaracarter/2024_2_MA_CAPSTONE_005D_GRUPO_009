import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogRoutingModule } from './blog-routing.module';

import { ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { BlogPost } from '../../../core/interfaces/blog/blog-post.interface';
import { BlogCreateComponent } from './blog-create/blog-create.component';
import { BlogEditComponent } from './blog-edit/blog-edit.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { BlogComponent } from '../../../pages/blog/blog.component';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipInputEvent } from '@angular/material/chips';
import { SharedModule } from '../../../shared/shared.module';


import { COMMA, ENTER } from '@angular/cdk/keycodes';

@NgModule({
  declarations: [
    BlogCreateComponent,
    BlogEditComponent,
    BlogListComponent,
    BlogDetailComponent,
    BlogComponent
  ],

  imports: [
    CommonModule,
    BlogRoutingModule,
    ReactiveFormsModule,
    EditorModule,
    NgxDropzoneModule,
    MatProgressBarModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatFormFieldModule,
    SharedModule,

  ],
  exports: [
    BlogListComponent,
    BlogCreateComponent,
    BlogEditComponent,
    BlogDetailComponent,
    BlogComponent
  ]
})
export class BlogModule { }
