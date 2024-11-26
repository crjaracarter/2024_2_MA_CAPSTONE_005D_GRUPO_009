// src/app/dashboard/pages/mi-empresa/tabs/documentos/documentos.component.ts

import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import {
  Storage,
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from '@angular/fire/storage';
import { Empresa } from '../../../../../core/interfaces/empresa.interface';

interface Documento {
  id?: string;
  nombre: string;
  url: string;
  tipo: string;
  fechaSubida: Date;
  tamano: string;
  categoria: string;
}

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxDropzoneModule],
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.scss'],
})
export class DocumentosComponent implements OnInit {
  @Input() empresa: Empresa | null = null;

  private storage = inject(Storage);

  documentos: Documento[] = [];
  categoriaSeleccionada: string = 'todos';
  cargando: boolean = false;
  subiendoArchivo: boolean = false;
  mensajeError: string = '';
  busqueda: string = '';

  categorias = [
    'Legal',
    'Recursos Humanos',
    'Financiero',
    'Operaciones',
    'Marketing',
    'Contratos',
    'Otros',
  ];

  ngOnInit() {
    this.cargarDocumentos();
  }

  async cargarDocumentos() {
    if (!this.empresa?.id) return;

    try {
      this.cargando = true;
      const storageRef = ref(
        this.storage,
        `empresas/${this.empresa.id}/documentos`
      );
      const res = await listAll(storageRef);

      this.documentos = await Promise.all(
        res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);

          return {
            nombre: itemRef.name,
            url: url,
            tipo: this.obtenerTipoArchivo(itemRef.name),
            fechaSubida: new Date(metadata.timeCreated),
            tamano: this.formateartamano(metadata.size),
            categoria: metadata.customMetadata?.['categoria'] || 'Otros',
          };
        })
      );
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      this.mensajeError = 'Error al cargar los documentos';
    } finally {
      this.cargando = false;
    }
  }

  async onSelect(event: any) {
    if (!this.empresa?.id) return;

    this.subiendoArchivo = true;
    this.mensajeError = '';

    try {
      for (const file of event.addedFiles) {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `empresas/${this.empresa.id}/documentos/${fileName}`;
        const fileRef = ref(this.storage, filePath);

        const metadata = {
          customMetadata: {
            categoria: this.categoriaSeleccionada || 'Otros',
          },
        };

        await uploadBytes(fileRef, file, metadata);
      }

      await this.cargarDocumentos();
    } catch (error) {
      console.error('Error al subir archivo:', error);
      this.mensajeError = 'Error al subir el archivo';
    } finally {
      this.subiendoArchivo = false;
    }
  }

  async eliminarDocumento(documento: Documento) {
    if (!this.empresa?.id) return;

    if (confirm(`¿Estás seguro de que deseas eliminar ${documento.nombre}?`)) {
      try {
        const fileRef = ref(
          this.storage,
          `empresas/${this.empresa.id}/documentos/${documento.nombre}`
        );
        await deleteObject(fileRef);
        this.documentos = this.documentos.filter(
          (doc) => doc.nombre !== documento.nombre
        );
      } catch (error) {
        console.error('Error al eliminar documento:', error);
        this.mensajeError = 'Error al eliminar el documento';
      }
    }
  }

  filtrarDocumentos(): Documento[] {
    return this.documentos.filter((doc) => {
      const cumpleFiltroCategoria =
        this.categoriaSeleccionada === 'todos' ||
        doc.categoria === this.categoriaSeleccionada;
      const cumpleBusqueda = doc.nombre
        .toLowerCase()
        .includes(this.busqueda.toLowerCase());
      return cumpleFiltroCategoria && cumpleBusqueda;
    });
  }

  private obtenerTipoArchivo(nombre: string): string {
    const extension = nombre.split('.').pop()?.toLowerCase() || '';
    const tipos: { [key: string]: string } = {
      pdf: 'PDF',
      doc: 'Word',
      docx: 'Word',
      xls: 'Excel',
      xlsx: 'Excel',
      jpg: 'Imagen',
      jpeg: 'Imagen',
      png: 'Imagen',
    };
    return tipos[extension] || 'Otro';
  }

  private formateartamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
