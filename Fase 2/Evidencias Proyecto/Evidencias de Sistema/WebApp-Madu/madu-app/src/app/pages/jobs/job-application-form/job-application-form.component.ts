import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { JobOfferService } from '../../../services/job-offer/job-offer.service';
import { FormTemplateService } from '../../../services/application-form/form-template.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { FormTemplate } from '../../../core/interfaces/application-form/form-template.interface';
import {
  FormQuestion,
  QuestionType,
} from '../../../core/interfaces/application-form/form-question.interface';
import { JobOffer } from '../../../core/interfaces/job-offer/job-offer.interface';
import { ToastrService } from 'ngx-toastr';
import { FileStorageService } from '../../../services/storage/file-storage.service';
import { JobApplicationService } from '../../../services/job-application/job-application.service';

@Component({
  selector: 'app-job-application-form',
  templateUrl: './job-application-form.component.html',
  styleUrls: ['./job-application-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class JobApplicationFormComponent implements OnInit {
  jobOffer: JobOffer | null = null;
  formTemplate: FormTemplate | null = null;
  applicationForm: FormGroup;
  loading = true;
  error = '';
  submitLoading = false;
  QuestionType = QuestionType; // Para usar en el template
  selectedFiles: { [key: string]: File } = {};

  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private jobOfferService: JobOfferService,
    private formTemplateService: FormTemplateService,
    private authService: AuthService,
    private fileStorageService: FileStorageService,
    private jobApplicationService: JobApplicationService
  ) {
    this.applicationForm = this.fb.group({});
  }

  ngOnInit(): void {
    const jobId = this.route.snapshot.params['id'];
    if (jobId) {
      this.loadJobApplication(jobId);
    } else {
      this.error = 'ID de oferta no encontrado';
      this.loading = false;
    }
  }

  private async loadJobApplication(jobId: string): Promise<void> {
    try {
      console.log('Loading job application for ID:', jobId);
      this.jobOffer = await this.jobOfferService.getJobOfferById(jobId);
      console.log('Job Offer loaded:', this.jobOffer);

      if (!this.jobOffer?.formTemplateId) {
        throw new Error('No se encontró el template ID en la oferta laboral');
      }

      console.log('Form Template ID:', this.jobOffer.formTemplateId);
      this.formTemplate = await this.formTemplateService.getFormTemplateById(
        this.jobOffer.formTemplateId
      );
      console.log('Form Template loaded:', this.formTemplate);

      if (this.formTemplate) {
        console.log('Questions:', this.formTemplate.questions);
        this.initializeForm();
      }
    } catch (err) {
      console.error('Error detallado:', err);
      this.error = 'Error al cargar el formulario de postulación';
    } finally {
      this.loading = false;
    }
  }

  private initializeForm(): void {
    if (!this.formTemplate) return;

    const formGroup: { [key: string]: any } = {};

    this.formTemplate.questions.forEach((question) => {
      const validators = this.getValidators(question);

      switch (question.type) {
        case QuestionType.MULTIPLE_CHOICE:
          formGroup[question.id] = this.fb.array([], validators);
          break;
        case QuestionType.FILE_UPLOAD:
          formGroup[question.id] = [null, validators];
          this.selectedFiles[question.id] = null as any;
          break;
        case QuestionType.NUMBER:
          formGroup[question.id] = [null, validators];
          break;
        case QuestionType.DATE:
          formGroup[question.id] = [null, validators];
          break;
        default:
          formGroup[question.id] = ['', validators];
      }
    });

    this.applicationForm = this.fb.group(formGroup);

    // Suscribirse a cambios en el formulario para debug
    if (this.formTemplate.settings?.debugMode) {
      this.applicationForm.valueChanges.subscribe((values) => {
        console.log('Form values:', values);
      });
    }
  }

  private getValidators(question: FormQuestion) {
    const validators = [];

    if (question.validation?.required) {
      validators.push(Validators.required);
    }

    if (question.type === QuestionType.EMAIL) {
      validators.push(Validators.email);
    }

    if (question.validation?.minLength) {
      validators.push(Validators.minLength(question.validation.minLength));
    }

    if (question.validation?.maxLength) {
      validators.push(Validators.maxLength(question.validation.maxLength));
    }

    if (question.validation?.pattern) {
      validators.push(Validators.pattern(question.validation.pattern));
    }

    if (question.type === QuestionType.NUMBER) {
      validators.push(Validators.pattern(/^-?\d*\.?\d+$/));
      if (question.validation?.minValue !== undefined) {
        validators.push(Validators.min(question.validation.minValue));
      }
      if (question.validation?.maxValue !== undefined) {
        validators.push(Validators.max(question.validation.maxValue));
      }
    }

    return validators;
  }

  isMultipleChoiceSelected(questionId: string, optionValue: string): boolean {
    const formArray = this.applicationForm.get(questionId) as FormArray;
    return formArray.value?.includes(optionValue) || false;
  }

  onMultipleChoiceChange(
    event: Event,
    questionId: string,
    optionValue: string
  ): void {
    const checkbox = event.target as HTMLInputElement;
    const formArray = this.applicationForm.get(questionId) as FormArray;

    if (checkbox.checked) {
      formArray.push(this.fb.control(optionValue));
    } else {
      const index = formArray.value.indexOf(optionValue);
      if (index >= 0) {
        formArray.removeAt(index);
      }
    }
  }

  async onFileSelected(event: Event, questionId: string): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      try {
        const question = this.formTemplate?.questions.find(
          (q) => q.id === questionId
        );

        if (!question?.validation) {
          this.toastr.error('Error en la validación del archivo');
          return;
        }

        // Validar tipo de archivo
        const fileType = file.type;
        if (
          question.validation.fileTypes?.length &&
          !question.validation.fileTypes.includes(fileType)
        ) {
          this.toastr.error('Tipo de archivo no permitido');
          input.value = '';
          return;
        }

        // Validar tamaño
        if (
          question.validation.maxFileSize &&
          file.size > question.validation.maxFileSize
        ) {
          const maxSizeMB = Math.round(
            question.validation.maxFileSize / (1024 * 1024)
          );
          this.toastr.error(
            `El archivo excede el tamaño máximo permitido (${maxSizeMB}MB)`
          );
          input.value = '';
          return;
        }

        // Almacenar el archivo seleccionado
        this.selectedFiles[questionId] = file;
        this.applicationForm.get(questionId)?.setValue(file);

        // Mostrar nombre del archivo seleccionado
        this.toastr.success(
          `Archivo "${file.name}" seleccionado correctamente`
        );
      } catch (error) {
        console.error('Error handling file:', error);
        this.toastr.error('Error al procesar el archivo');
        input.value = '';
      }
    }
  }

  getFileName(questionId: string): string {
    const file = this.selectedFiles[questionId];
    return file ? file.name : 'Ningún archivo seleccionado';
  }

  async onSubmit(): Promise<void> {
    if (this.applicationForm.invalid) {
      this.markFormGroupTouched(this.applicationForm);
      this.toastr.error('Por favor, complete todos los campos requeridos');
      return;
    }

    this.submitLoading = true;

    try {
      const user = await this.authService.getCurrentUser();
      if (!user || !this.jobOffer?.id) {
        throw new Error('No se pudo completar la postulación');
      }

      // Verificar postulación previa
      const hasApplied = await this.jobOfferService.hasUserApplied(
        this.jobOffer.id,
        user.uid
      );

      if (hasApplied) {
        this.toastr.error('Ya has postulado a esta oferta laboral');
        return;
      }

      // Procesar archivos
      await this.processFilesBeforeSubmit();

      // Preparar respuestas
      const responses = await this.prepareResponses();

      const applicationId = await this.jobApplicationService.createJobApplication({
        jobOfferId: this.jobOffer.id,
        employeeId: user.uid,
        responses,
        status: 'pending',
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Crear postulación
      await this.jobApplicationService.createJobApplication({
        jobOfferId: this.jobOffer.id,
        employeeId: user.uid,
        responses,
        status: 'pending',
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      this.toastr.success('Postulación enviada exitosamente');
      this.router.navigate(['/trabajos/postulacion-exitosa', this.jobOffer.id, applicationId], {
        state: {
          jobOfferId: this.jobOffer.id,
          jobTitle: this.jobOffer.title,
          companyName: this.jobOffer.companyName,
        },
      });
    } catch (error) {
      console.error('Error al enviar postulación:', error);
      this.toastr.error('Error al enviar la postulación');
    } finally {
      this.submitLoading = false;
    }
  }

  private async prepareResponses() {
    const formValues = this.applicationForm.value;
    return Object.entries(formValues).map(([questionId, value]) => ({
      questionId,
      answer: this.formatAnswer(value),
    }));
  }

  private formatAnswer(value: any): string {
    if (value instanceof File) {
      return value.name;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value || '');
  }

  getErrorMessage(questionId: string): string {
    const control = this.applicationForm.get(questionId);
    if (!control?.errors || !control.touched) return '';

    const errors = control.errors;
    if (errors['required']) return 'Este campo es requerido';
    if (errors['email']) return 'Email inválido';
    if (errors['minlength'])
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength'])
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `Valor mínimo permitido: ${errors['min'].min}`;
    if (errors['max']) return `Valor máximo permitido: ${errors['max'].max}`;
    if (errors['pattern']) return 'Formato inválido';

    return 'Error de validación';
  }

  private async processFilesBeforeSubmit(): Promise<void> {
    for (const [questionId, file] of Object.entries(this.selectedFiles)) {
      if (file instanceof File) {
        try {
          const uploadedUrl = await this.fileStorageService.uploadCV(file);
          this.applicationForm.get(questionId)?.setValue(uploadedUrl);
        } catch (error) {
          console.error('Error uploading file:', error);
          throw new Error(`Error al subir el archivo ${file.name}`);
        }
      }
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
      if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }

  goBack(): void {
    const jobId = this.route.snapshot.params['id'];
    if (jobId) {
      this.router.navigate(['/trabajos/detalle', jobId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
