// custom-questions-builder.component.ts
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CdkDragDrop,
  moveItemInArray,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../../../../../../core/notification/notification.service';

import {
  QuestionType,
  FormQuestion,
  QuestionValidation,
} from '../../../../../../../core/interfaces/application-form/form-question.interface';
import { FormTemplateService } from '../../../../../../../services/application-form/form-template.service';
import { ReplacePipe } from '../../../../../../../shared/pipes/replace.pipe';

@Component({
  selector: 'app-custom-questions-builder',
  templateUrl: './custom-questions-builder.component.html',
  styleUrls: ['./custom-questions-builder.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    ReplacePipe,
  ],
})
export class CustomQuestionsBuilderComponent {
  @Input() templateId!: string;
  @Input() questions: FormQuestion[] = [];
  @Output() questionsChange = new EventEmitter<FormQuestion[]>();

  questionForm!: FormGroup;
  questionTypes = Object.entries(QuestionType).map(([key, value]) => value);
  currentEditingQuestion: FormQuestion | null = null;
  isEditMode = false;
  isLoading = false;

  private notificationService = inject(NotificationService);

  constructor(
    private fb: FormBuilder,
    private formTemplateService: FormTemplateService
  ) {
    this.initForm();
  }

  private initForm() {
    this.questionForm = this.fb.group({
      type: ['', Validators.required],
      label: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      placeholder: [''],
      helpText: [''],
      validation: this.fb.group({
        required: [false],
        minLength: [null],
        maxLength: [null],
        pattern: [''],
        customMessage: [''],
        fileTypes: [[]],
        maxFileSize: [null],
        minValue: [null],
        maxValue: [null],
        scaleRange: this.fb.group({
          min: [null],
          max: [null],
        }),
      }),
      options: this.fb.array([]),
      order: [0],
      conditionalDisplay: this.fb.group({
        dependsOn: [''],
        condition: ['equals'],
        value: [''],
      }),
    });

    // Escuchar cambios en el tipo de pregunta
    this.questionForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateFormValidationsByType(type);
    });
  }

  // ngOnInit() {
  //   if (!this.questions.length) {
  //     this.loadDefaultQuestions();
  //   }
  // }

  // private loadDefaultQuestions() {
  //   const cvQuestionExists = this.questions.some((q) => q.id === 'cv_upload');

  //   // Pregunta del CV por defecto
  //   if (!cvQuestionExists) {
  //     const cvQuestion: FormQuestion = {
  //       id: 'cv_upload',
  //       sectionId: 'default_section',
  //       type: QuestionType.FILE_UPLOAD,
  //       label: 'Currículum Vitae',
  //       description: 'Por favor sube tu CV en formato PDF o Word',
  //       helpText: 'Archivos permitidos: PDF, DOC, DOCX. Tamaño máximo: 5MB',
  //       validation: {
  //         required: true,
  //         fileTypes: [
  //           'application/pdf',
  //           'application/msword',
  //           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //         ],
  //         maxFileSize: 5242880,
  //         customMessage: 'Por favor, sube tu currículum vitae',
  //       },
  //       order: 0,
  //       isEditable: false,
  //       isVisible: true,
  //     };

  //     this.questions = [cvQuestion, ...this.questions];
  //     this.questionsChange.emit(this.questions);
  //   }
  // }

  private updateFormValidationsByType(type: QuestionType) {
    const validationGroup = this.questionForm.get('validation') as FormGroup;
    const optionsArray = this.questionForm.get('options') as FormArray;

    // Resetear todas las validaciones
    Object.keys(validationGroup.controls).forEach((key) => {
      validationGroup.get(key)?.clearValidators();
      validationGroup.get(key)?.updateValueAndValidity();
    });

    // Limpiar opciones si el tipo no las requiere
    if (!['single-choice', 'multiple-choice', 'dropdown'].includes(type)) {
      optionsArray.clear();
    }

    // Aplicar validaciones según el tipo
    switch (type) {
      case QuestionType.SHORT_TEXT:
      case QuestionType.LONG_TEXT:
        validationGroup.get('minLength')?.setValidators([Validators.min(0)]);
        validationGroup.get('maxLength')?.setValidators([Validators.min(1)]);
        break;

      case QuestionType.FILE_UPLOAD:
        validationGroup
          .get('maxFileSize')
          ?.setValidators([Validators.required, Validators.min(1)]);
        validationGroup.get('fileTypes')?.setValidators([Validators.required]);
        break;

      case QuestionType.NUMBER:
        validationGroup.get('minValue')?.setValidators([Validators.required]);
        validationGroup.get('maxValue')?.setValidators([Validators.required]);
        break;

      case QuestionType.SCALE:
        const scaleRange = validationGroup.get('scaleRange') as FormGroup;
        scaleRange
          .get('min')
          ?.setValidators([Validators.required, Validators.min(0)]);
        scaleRange
          .get('max')
          ?.setValidators([Validators.required, Validators.min(1)]);
        break;

      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.DROPDOWN:
        this.initOptionsArray();
        break;
    }

    validationGroup.updateValueAndValidity();
  }

  private initOptionsArray() {
    const optionsArray = this.questionForm.get('options') as FormArray;
    optionsArray.clear();
    this.addOption(); // Agregar al menos una opción
  }

  addOption() {
    const optionsArray = this.questionForm.get('options') as FormArray;
    const newOption = this.fb.group({
      value: ['', Validators.required],
      label: ['', Validators.required],
      description: [''],
    });
    optionsArray.push(newOption);
  }

  removeOption(index: number) {
    const optionsArray = this.questionForm.get('options') as FormArray;
    if (optionsArray.length > 1) {
      optionsArray.removeAt(index);
    } else {
      this.notificationService.warning('Debe haber al menos una opción');
    }
  }

  async addQuestion() {
    if (this.questionForm.valid) {
      try {
        this.isLoading = true;
        const formValue = this.questionForm.value;

        // Crear la nueva pregunta
        const newQuestion: FormQuestion = {
          id: this.isEditMode
            ? this.currentEditingQuestion!.id
            : `question_${Date.now()}`,
          sectionId: 'default_section',
          type: formValue.type,
          label: formValue.label.trim(),
          description: formValue.description?.trim(),
          placeholder: formValue.placeholder?.trim(),
          helpText: formValue.helpText?.trim(),
          validation: {
            ...formValue.validation,
            ...this.getCleanValidationsByType(
              formValue.type,
              formValue.validation
            ),
          },
          options: formValue.options,
          order: this.isEditMode
            ? this.currentEditingQuestion!.order
            : this.questions.length,
          isEditable: true,
          isVisible: true,
          conditionalDisplay: formValue.conditionalDisplay,
        };

        // Crear una nueva array de preguntas para mantener inmutabilidad
        let updatedQuestions: FormQuestion[];

        if (this.isEditMode) {
          const index = this.questions.findIndex(
            (q) => q.id === newQuestion.id
          );
          updatedQuestions = [
            ...this.questions.slice(0, index),
            newQuestion,
            ...this.questions.slice(index + 1),
          ];
        } else {
          // Asegurarnos de que mantenemos la pregunta del CV al inicio
          const cvQuestion = this.questions.find((q) => q.id === 'cv_upload');
          const otherQuestions = this.questions.filter(
            (q) => q.id !== 'cv_upload'
          );

          if (cvQuestion) {
            updatedQuestions = [cvQuestion, ...otherQuestions, newQuestion];
          } else {
            updatedQuestions = [...this.questions, newQuestion];
          }
        }

        // Actualizar el orden de todas las preguntas
        updatedQuestions = updatedQuestions.map((q, index) => ({
          ...q,
          order: index,
        }));

        console.log('Template ID:', this.templateId);
        console.log('Questions to save:', updatedQuestions);

        // Actualizar en Firebase
        await this.formTemplateService.updateFormTemplate(
          this.templateId,
          updatedQuestions
        );

        this.questions = updatedQuestions;
        this.questionsChange.emit(this.questions);
        this.resetForm();

        this.notificationService.success(
          this.isEditMode
            ? 'Pregunta actualizada correctamente'
            : 'Pregunta agregada correctamente'
        );
      } catch (error) {
        console.error('Error saving question:', error);
        this.notificationService.error('Error al guardar la pregunta');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched(this.questionForm);
    }
  }

  private getCleanValidationsByType(
    type: QuestionType,
    validation: QuestionValidation
  ): Partial<QuestionValidation> {
    const cleanValidation: Partial<QuestionValidation> = {
      required: validation.required,
    };

    switch (type) {
      case QuestionType.SHORT_TEXT:
      case QuestionType.LONG_TEXT:
        if (validation.minLength)
          cleanValidation.minLength = validation.minLength;
        if (validation.maxLength)
          cleanValidation.maxLength = validation.maxLength;
        break;

      case QuestionType.FILE_UPLOAD:
        cleanValidation.fileTypes = validation.fileTypes;
        cleanValidation.maxFileSize = validation.maxFileSize;
        break;

      case QuestionType.NUMBER:
        if (validation.minValue) cleanValidation.minValue = validation.minValue;
        if (validation.maxValue) cleanValidation.maxValue = validation.maxValue;
        break;

      case QuestionType.SCALE:
        cleanValidation.scaleRange = validation.scaleRange;
        break;
    }

    return cleanValidation;
  }

  editQuestion(question: FormQuestion) {
    if (!question.isEditable) {
      this.notificationService.warning('Esta pregunta no se puede editar');
      return;
    }

    this.isEditMode = true;
    this.currentEditingQuestion = question;

    // Resetear el formulario antes de cargar los nuevos valores
    this.initForm();

    // Cargar las opciones si existen
    if (question.options?.length) {
      const optionsArray = this.questionForm.get('options') as FormArray;
      optionsArray.clear();
      question.options.forEach((option) => {
        optionsArray.push(
          this.fb.group({
            value: [option.value, Validators.required],
            label: [option.label, Validators.required],
            description: [option.description || ''],
          })
        );
      });
    }

    // Actualizar el formulario con los valores de la pregunta
    this.questionForm.patchValue({
      type: question.type,
      label: question.label,
      description: question.description || '',
      placeholder: question.placeholder || '',
      helpText: question.helpText || '',
      validation: {
        ...question.validation,
      },
      conditionalDisplay: question.conditionalDisplay || {
        dependsOn: '',
        condition: 'equals',
        value: '',
      },
    });
  }

  async deleteQuestion(index: number) {
    try {
      // Validar que el índice sea válido
      if (index < 0 || index >= this.questions.length) {
        this.notificationService.error('Índice de pregunta inválido');
        return;
      }

      const question = this.questions[index];

      // Prevenir eliminación de la pregunta CV
      if (question.id === 'cv_upload') {
        this.notificationService.warning(
          'La pregunta del CV no se puede eliminar'
        );
        return;
      }

      // Validar que la pregunta exista y sea editable
      if (!question || !question.isEditable) {
        this.notificationService.warning('Esta pregunta no se puede eliminar');
        return;
      }

      // Solicitar confirmación antes de eliminar
      const confirmed = await this.confirmDelete();
      if (!confirmed) {
        return;
      }

      this.isLoading = true;

      // Validar que exista templateId
      if (!this.templateId) {
        throw new Error('Template ID no encontrado');
      }

      console.log('Eliminando pregunta...', {
        templateId: this.templateId,
        questionToDelete: question,
        currentQuestions: this.questions,
      });

      // Crear una copia del array de preguntas para mantener inmutabilidad
      const updatedQuestions = this.questions.filter((_, i) => i !== index);

      // Actualizar el orden de las preguntas restantes
      updatedQuestions.forEach((q, idx) => {
        q.order = idx;
      });

      // Actualizar en Firebase
      await this.formTemplateService.updateFormTemplate(
        this.templateId,
        updatedQuestions
      );

      // Actualizar el estado local
      this.questions = updatedQuestions;
      this.questionsChange.emit(this.questions);

      console.log('Preguntas después de eliminar:', this.questions);
      this.notificationService.success('Pregunta eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar la pregunta:', error);
      this.notificationService.error('Error al eliminar la pregunta');
    } finally {
      this.isLoading = false;
    }
  }

  // Mantén la función auxiliar para confirmar la eliminación
  private confirmDelete(): Promise<boolean> {
    return new Promise((resolve) => {
      const result = confirm(
        '¿Estás seguro de que deseas eliminar esta pregunta?'
      );
      resolve(result);
    });
  }

  onDrop(event: CdkDragDrop<FormQuestion[]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    this.questions.forEach((q, index) => (q.order = index));
    this.questionsChange.emit(this.questions);

    // Actualizar en Firebase
    this.formTemplateService
      .updateFormTemplate(this.templateId, this.questions)
      .catch((error) => {
        console.error('Error reordering questions:', error);
        this.notificationService.error('Error al reordenar las preguntas');
      });
  }

  duplicateQuestion(question: FormQuestion) {
    const duplicatedQuestion: FormQuestion = {
      ...JSON.parse(JSON.stringify(question)),
      id: `question_${Date.now()}`,
      label: `${question.label} (copia)`,
      order: this.questions.length,
    };

    this.questions.push(duplicatedQuestion);
    this.questionsChange.emit(this.questions);

    // Actualizar en Firebase
    this.formTemplateService
      .updateFormTemplate(this.templateId, this.questions)
      .catch((error) => {
        console.error('Error duplicating question:', error);
        this.notificationService.error('Error al duplicar la pregunta');
      });
  }

  resetForm() {
    this.isEditMode = false;
    this.currentEditingQuestion = null;
    this.initForm();
  }

  getValidationErrors(fieldName: string): string[] {
    const control = this.questionForm.get(fieldName);
    if (control?.errors && (control.dirty || control.touched)) {
      return Object.keys(control.errors).map((key) => {
        switch (key) {
          case 'required':
            return 'Este campo es requerido';
          case 'minLength':
            return `El texto debe tener al menos ${control.errors?.[key]?.requiredLength} caracteres`;
          case 'min':
            return `El valor debe ser mayor o igual a ${control.errors?.[key]?.min}`;
          case 'max':
            return `El valor debe ser menor o igual a ${control.errors?.[key]?.max}`;
          default:
            return 'Error de validación';
        }
      });
    }
    return [];
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get optionsFormArray() {
    return this.questionForm.get('options') as FormArray;
  }
}
