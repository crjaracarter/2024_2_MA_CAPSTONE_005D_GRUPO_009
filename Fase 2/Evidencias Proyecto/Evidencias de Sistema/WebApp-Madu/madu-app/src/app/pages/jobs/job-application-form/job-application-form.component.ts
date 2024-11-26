// src/app/pages/jobs/job-application-form/job-application-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobOffer } from '../../../core/interfaces/job-offer/job-offer.interface';
import { FormTemplate } from '../../../core/interfaces/application-form/form-template.interface';
import { FormQuestion } from '../../../core/interfaces/application-form/form-question.interface';
import { JobOfferService } from '../../../services/job-offer/job-offer.service';
import { ApplicationFormService } from '../../../services/application-form/application-form.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { JobApplicationRequest } from '../../../core/interfaces/job-application/job-application-request.interface';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

@Component({
  selector: 'app-job-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './job-application-form.component.html',
  styleUrl: './job-application-form.component.scss',
})
export class JobApplicationFormComponent implements OnInit {
  jobOffer: JobOffer | null = null;
  formTemplate: FormTemplate | null = null;
  applicationForm: FormGroup;
  isLoading = true;
  error: string | null = null;
  userId: string | undefined;
  cvFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private jobOfferService: JobOfferService,
    private applicationFormService: ApplicationFormService,
    private authService: AuthService,
    private location: Location
  ) {
    this.applicationForm = this.fb.group({
      coverLetter: ['', Validators.required],
      // Los campos dinámicos se agregarán después
    });
  }

  goBack(): void {
    this.location.back();
  }

  ngOnInit() {
    this.authService.getUserData().subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        this.loadJobOffer();
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  private async loadJobOffer() {
    try {
      const jobId = this.route.snapshot.params['id'];
      this.jobOffer = await this.jobOfferService.getJobOfferById(jobId);

      if (this.jobOffer) {
        await this.loadFormTemplate();
      } else {
        this.error = 'Oferta no encontrada';
      }
    } catch (error) {
      this.error = 'Error al cargar la oferta';
      console.error('Error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadFormTemplate() {
    if (this.jobOffer?.formTemplateId) {
      try {
        this.formTemplate =
          await this.applicationFormService.getFormTemplateById(
            this.jobOffer.formTemplateId
          );
        if (this.formTemplate) {
          this.buildDynamicForm();
        }
      } catch (error) {
        console.error('Error loading form template:', error);
      }
    }
  }

  private buildDynamicForm() {
    if (!this.formTemplate) return;

    const formGroup: any = {
      coverLetter: ['', Validators.required],
    };

    this.formTemplate.questions.forEach((question) => {
      formGroup[`question_${question.id}`] = [
        '',
        question.required ? Validators.required : [],
      ];
    });

    this.applicationForm = this.fb.group(formGroup);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo y tamaño
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        this.error = 'Solo se permiten archivos PDF o Word';
        return;
      }

      if (file.size > maxSize) {
        this.error = 'El archivo no debe superar los 5MB';
        return;
      }

      this.cvFile = file;
      this.error = null;
    }
  }

  async onSubmit() {
    if (
      this.applicationForm.invalid ||
      !this.cvFile ||
      !this.userId ||
      !this.jobOffer
    ) {
      return;
    }

    try {
      const formData = this.applicationForm.value;
      const cvUrl = await this.uploadCV();
      console.log('CV subido exitosamente:', cvUrl);

      // Crear la postulación
      const applicationId = await this.jobOfferService.createJobApplication({
        jobOfferId: this.jobOffer.id!,
        employeeId: this.userId,
        coverLetter: formData.coverLetter,
        responses:
          this.formTemplate?.questions.map((q) => ({
            questionId: q.id,
            answer: formData[`question_${q.id}`],
          })) || [],
        cvUrl,
        jobTitle: this.jobOffer.title,
      });

      console.log('Navegando a:', `/jobs/application-success/${applicationId}`);

      // Usar navigate con skipLocationChange: false
      await this.router.navigate(['/jobs/application-success', applicationId], {
        skipLocationChange: false,
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      this.error = 'Error al enviar la postulación';
    }
  }

  private async uploadCV(): Promise<string> {
    if (!this.cvFile || !this.userId) return '';

    try {
      const storage = getStorage();
      const fileExtension = this.cvFile.name.split('.').pop();
      const fileName = `cv/${this.userId}/${Date.now()}_${this.cvFile.name}`;
      const storageRef = ref(storage, fileName);

      // Configurar los metadatos del archivo
      const metadata = {
        contentType: this.cvFile.type,
        customMetadata: {
          'uploaded-by': this.userId,
        },
      };

      // Subir el archivo con los metadatos
      const snapshot = await uploadBytes(storageRef, this.cvFile, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('Archivo subido exitosamente:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading CV:', error);
      throw new Error('Error al subir el CV');
    }
  }
}
