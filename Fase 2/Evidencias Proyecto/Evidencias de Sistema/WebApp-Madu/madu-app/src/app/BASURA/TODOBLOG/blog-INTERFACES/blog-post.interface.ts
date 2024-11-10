// src/app/core/interfaces/blog/blog-post.interface.ts
export interface BlogPost {
  id?: string;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  status: 'draft' | 'published';
  authorId: string;
  author?: {
    name: string;
    photoURL?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  views?: number;
  readTime?: number; // Tiempo estimado de lectura en minutos
  excerpt?: string; // Resumen corto del contenido
  slug?: string; // URL amigable generada desde el título
}

// Podemos agregar también algunas interfaces auxiliares

export interface BlogPostCreate {
  title: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  status: 'draft' | 'published';
  authorId: string;
}

export interface BlogPostUpdate {
  id: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  tags?: string[];
  status?: 'draft' | 'published';
}

// Interface para los filtros de búsqueda
export interface BlogPostFilters {
  search?: string;
  tag?: string;
  status?: 'draft' | 'published';
  authorId?: string;
  startDate?: Date;
  endDate?: Date;
}

// Interface para la paginación
export interface BlogPostPagination {
  page: number;
  limit: number;
  total?: number;
  hasMore?: boolean;
}
