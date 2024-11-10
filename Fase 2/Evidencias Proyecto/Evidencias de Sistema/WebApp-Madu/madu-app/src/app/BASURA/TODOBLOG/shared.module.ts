// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripHtmlPipe } from './pipes/strip-html.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

@NgModule({
  declarations: [
    StripHtmlPipe,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    StripHtmlPipe,
    SafeHtmlPipe
  ]
})
export class SharedModule { }