// src/app/dashboard/pages/mi-empresa/tabs/ofertas/components/job-offer-form/job-offer-form.component.ts

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  JobOffer,
  JobOfferStatus,
  JobType,
  WorkModality,
  ExperienceLevel,
} from '../../../../../../../core/interfaces/job-offer/job-offer.interface';
import { JobOfferService } from '../../../../../../../services/job-offer/job-offer.service';
import { CustomQuestionsBuilderComponent } from '../custom-questions-builder/custom-questions-builder.component';
import { JobPreviewComponent } from '../job-preview/job-preview.component';
import { NotificationService } from '../../../../../../../core/notification/notification.service';
import { FormTemplateService } from '../../../../../../../services/application-form/form-template.service';
import { AuthService } from '../../../../../../../auth/data-access/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-job-offer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomQuestionsBuilderComponent,
    JobPreviewComponent,
  ],
  templateUrl: './job-offer-form.component.html',
  styleUrls: ['./job-offer-form.component.scss'],
})
export class JobOfferFormComponent implements OnInit {
  @Input() offer?: JobOffer; // Para modo edición
  @Output() saveSuccess = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Input() jobData!: JobOffer;

  private fb = inject(FormBuilder);
  private jobOfferService = inject(JobOfferService);
  private notificationService = inject(NotificationService);
  private formTemplateService = inject(FormTemplateService);
  private authService = inject(AuthService);

  formTemplateId: string | null = null;
  currentStep = 1;
  totalSteps = 4;
  isSubmitting = false;
  showPreview = false;

  // Enums para los selectores
  jobTypes = Object.values(JobType);
  workModalities = Object.values(WorkModality);
  experienceLevels = Object.values(ExperienceLevel);
  departmentOptions: string[] = ['IT', 'HR', 'Finance', 'Marketing']; // Add this line

  // Formularios para cada paso
  basicInfoForm!: FormGroup;
  requirementsForm!: FormGroup;
  benefitsForm!: FormGroup;
  customQuestionsForm!: FormGroup;

  async ngOnInit() {
    this.initializeForms();

    if (this.offer) {
      this.populateFormsWithOffer();
      this.formTemplateId = this.offer.formTemplateId || null;
    } else {
      // Si es una nueva oferta, crear el template inmediatamente
      try {
        const user = await firstValueFrom(this.authService.getUserData());
        if (user?.uid) {
          // Crear un ID temporal para la oferta
          const tempOfferId = `temp_${Date.now()}`;
          this.formTemplateId =
            await this.formTemplateService.createFormTemplate(
              tempOfferId,
              user.uid
            );
        }
      } catch (error) {
        console.error('Error creating template:', error);
        this.notificationService.error(
          'Error al inicializar el formulario de preguntas'
        );
      }
    }
    // Inicializar el form de preguntas
    this.customQuestionsForm = this.fb.group({
      questions: this.fb.array([]),
    });
  }

  private initializeForms(): void {
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      department: ['', Validators.required],
      shortDescription: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.minLength(100)]],
      type: ['', Validators.required],
      modality: ['', Validators.required],
      experienceLevel: ['', Validators.required],
      location: this.fb.group({
        country: ['', Validators.required],
        region: ['', Validators.required],
        city: ['', Validators.required],
        isRemoteAllowed: [false],
      }),
      salary: this.fb.group({
        min: [null, [Validators.required, Validators.min(0)]],
        max: [null, [Validators.required, Validators.min(0)]],
        currency: ['CLP', Validators.required],
        showInOffer: [true],
      }),
      positions: [1, [Validators.required, Validators.min(1)]],
    });

    this.requirementsForm = this.fb.group({
      essential: this.fb.array([]),
      desirable: this.fb.array([]),
      skills: this.fb.group({
        technical: this.fb.array([]),
        soft: this.fb.array([]),
      }),
    });

    this.benefitsForm = this.fb.group({
      benefits: this.fb.array([]),
    });

    this.customQuestionsForm = this.fb.group({
      questions: this.fb.array([]),
    });
  }

  private populateFormsWithOffer(): void {
    if (!this.offer) return;

    this.basicInfoForm.patchValue({
      title: this.offer.title,
      department: this.offer.department,
      shortDescription: this.offer.shortDescription,
      description: this.offer.description,
      type: this.offer.type,
      modality: this.offer.modality,
      experienceLevel: this.offer.experienceLevel,
      location: this.offer.location,
      salary: this.offer.salary,
      positions: this.offer.positions,
    });

    // Poblar requisitos
    const essentialArray = this.requirementsForm.get('essential') as FormArray;
    const desirableArray = this.requirementsForm.get('desirable') as FormArray;

    this.offer.requirements.essential.forEach((req) => {
      essentialArray.push(this.fb.control(req));
    });
    this.offer.requirements.desirable.forEach((req) => {
      desirableArray.push(this.fb.control(req));
    });

    // Poblar skills
    const technicalArray = this.requirementsForm.get(
      'skills.technical'
    ) as FormArray;
    const softArray = this.requirementsForm.get('skills.soft') as FormArray;

    this.offer.skills.technical.forEach((skill) => {
      technicalArray.push(this.fb.control(skill));
    });
    this.offer.skills.soft.forEach((skill) => {
      softArray.push(this.fb.control(skill));
    });

    // Poblar beneficios
    const benefitsArray = this.benefitsForm.get('benefits') as FormArray;
    this.offer.benefits.forEach((benefit) => {
      benefitsArray.push(this.fb.group(benefit));
    });
  }

  // Manejo de pasos del formulario
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.validateCurrentStep()) {
        this.currentStep++;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  public validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.basicInfoForm.valid;
      case 2:
        return this.requirementsForm.valid;
      case 3:
        return this.benefitsForm.valid;
      case 4:
        return this.customQuestionsForm.valid;
      default:
        return false;
    }
  }

  // Manejo de arrays de formulario
  addRequirement(type: 'essential' | 'desirable'): void {
    const array = this.requirementsForm.get(type) as FormArray;
    array.push(this.fb.control(''));
  }

  removeRequirement(type: 'essential' | 'desirable', index: number): void {
    const array = this.requirementsForm.get(type) as FormArray;
    array.removeAt(index);
  }

  addSkill(type: 'technical' | 'soft'): void {
    const array = this.requirementsForm.get(`skills.${type}`) as FormArray;
    array.push(this.fb.control(''));
  }

  removeSkill(type: 'technical' | 'soft', index: number): void {
    const array = this.requirementsForm.get(`skills.${type}`) as FormArray;
    array.removeAt(index);
  }

  addBenefit(): void {
    const benefitsArray = this.benefitsForm.get('benefits') as FormArray;
    benefitsArray.push(
      this.fb.group({
        category: ['', Validators.required],
        title: ['', Validators.required],
        description: ['', Validators.required],
        iconName: [''],
      })
    );
  }

  removeBenefit(index: number): void {
    const benefitsArray = this.benefitsForm.get('benefits') as FormArray;
    benefitsArray.removeAt(index);
  }

  // Manejo de vista previa
  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  getPreviewData(): JobOffer {
    const basicInfo = this.basicInfoForm.value;
    const requirements = this.requirementsForm.value;
    const benefits = this.benefitsForm.value.benefits;
    const defaultData = this.getDefaultJobOffer();

    return {
      ...defaultData,
      ...basicInfo,
      requirements,
      benefits,
      id: this.offer?.id,
      createdAt: this.offer?.createdAt || new Date(),
      updatedAt: new Date(),
      version: this.offer?.version || 1,
    } as JobOffer;
  }

  // Guardar oferta
  async saveOffer(): Promise<void> {
    if (!this.validateAllSteps()) {
      this.notificationService.error(
        'Por favor complete todos los campos requeridos'
      );
      return;
    }

    try {
      this.isSubmitting = true;

      const user = await firstValueFrom(this.authService.getUserData());
      if (!user?.uid) {
        throw new Error('No se encontró información del usuario');
      }

      // Obtener los valores de los formularios
      const basicInfo = this.basicInfoForm.value;
      const requirementsForm = this.requirementsForm.value;
      const benefitsForm = this.benefitsForm.value;

      // Construir el objeto completo de la oferta
      const offerData: Partial<JobOffer> = {
        // Información básica
        title: basicInfo.title,
        department: basicInfo.department,
        shortDescription: basicInfo.shortDescription,
        description: basicInfo.description,
        type: basicInfo.type,
        modality: basicInfo.modality,
        experienceLevel: basicInfo.experienceLevel,
        positions: basicInfo.positions,

        // Ubicación
        location: {
          country: basicInfo.location.country,
          region: basicInfo.location.region,
          city: basicInfo.location.city,
          isRemoteAllowed: basicInfo.location.isRemoteAllowed,
        },

        // Salario
        salary: {
          min: basicInfo.salary.min,
          max: basicInfo.salary.max,
          currency: basicInfo.salary.currency,
          period: 'monthly', // Agregar si no existe
          isNegotiable: false, // Agregar si no existe
          showInOffer: basicInfo.salary.showInOffer,
        },

        // Requisitos y habilidades
        requirements: {
          essential: requirementsForm.essential || [],
          desirable: requirementsForm.desirable || [],
        },

        skills: {
          technical: requirementsForm.skills?.technical || [],
          soft: requirementsForm.skills?.soft || [],
        },

        // Beneficios
        benefits: benefitsForm.benefits || [],

        // Metadata
        employerId: user.uid,
        status: JobOfferStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,

        // Campos adicionales necesarios
        metrics: {
          views: 0,
          applications: 0,
          shares: 0,
        },
        applicationProcess: {
          steps: [],
          estimatedDuration: '',
        },
        keywords: [],
        isHighlighted: false,
        isConfidential: false,
      };

      let offerId: string;

      if (this.offer?.id) {
        await this.jobOfferService.updateJobOffer(this.offer.id, {
          ...offerData,
          updatedAt: new Date(),
          version: (this.offer.version || 0) + 1,
        });
        offerId = this.offer.id;
      } else {
        offerId = await this.jobOfferService.createJobOffer(
          offerData as JobOffer
        );
      }

      if (offerId) {
        try {
          // Si ya teníamos un template temporal, actualizarlo con el nuevo offerId
          if (this.formTemplateId) {
            await this.formTemplateService.updateTemplateJobOfferId(
              this.formTemplateId,
              offerId
            );
          } else {
            // Si no teníamos template, crear uno nuevo
            const templateId =
              await this.formTemplateService.createFormTemplate(
                offerId,
                user.uid
              );
            this.formTemplateId = templateId;
          }

          // Actualizar la oferta con el ID del template
          await this.jobOfferService.updateJobOffer(offerId, {
            formTemplateId: this.formTemplateId,
          });
        } catch (templateError) {
          console.error('Error managing form template:', templateError);
          this.notificationService.error(
            'Error al gestionar el template de preguntas'
          );
        }
      }

      this.notificationService.success(
        this.offer
          ? 'Oferta actualizada exitosamente'
          : 'Oferta creada exitosamente'
      );
      this.saveSuccess.emit();
    } catch (error) {
      console.error('Error saving job offer:', error);
      this.notificationService.error('Error al guardar la oferta');
    } finally {
      this.isSubmitting = false;
    }
  }

  public validateAllSteps(): boolean {
    return (
      this.basicInfoForm.valid &&
      this.requirementsForm.valid &&
      this.benefitsForm.valid &&
      this.customQuestionsForm.valid
    );
  }

  // Helpers
  getFormArrayControls(path: string): AbstractControl[] {
    const formArray = this.requirementsForm.get(path) as FormArray;
    return formArray.controls;
  }

  getBenefitsControls(): AbstractControl[] {
    return (this.benefitsForm.get('benefits') as FormArray).controls;
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onQuestionsChange(questions: any[]): void {
    const questionsArray = this.customQuestionsForm.get(
      'questions'
    ) as FormArray;

    // Limpia el array actual
    while (questionsArray.length) {
      questionsArray.removeAt(0);
    }

    // Agrega las nuevas preguntas
    questions.forEach((question) => {
      questionsArray.push(
        this.fb.group({
          type: [question.type, Validators.required],
          label: [question.label, Validators.required],
          description: [question.description],
          validation: this.fb.group({
            required: [question.validation?.required || false],
            minLength: [question.validation?.minLength],
            maxLength: [question.validation?.maxLength],
            pattern: [question.validation?.pattern],
            customMessage: [question.validation?.customMessage],
          }),
          options: this.fb.array(
            (question.options || []).map((opt: any) =>
              this.fb.group({
                value: [opt.value],
                label: [opt.label],
                description: [opt.description],
              })
            )
          ),
          order: [question.order],
        })
      );
    });
  }
  private getDefaultJobOffer(): Partial<JobOffer> {
    return {
      employerId: '', // Este se llenará al guardar
      companyName: '',
      status: JobOfferStatus.DRAFT,
      metrics: {
        views: 0,
        applications: 0,
        shares: 0,
      },
      keywords: [],
      isHighlighted: false,
      isConfidential: false,
      applicationProcess: {
        steps: [],
        estimatedDuration: '',
      },
      requirements: {
        // Agregar esto
        essential: [],
        desirable: [],
      },
      skills: {
        // Agregar esto
        technical: [],
        soft: [],
      },
    };
  }
}
