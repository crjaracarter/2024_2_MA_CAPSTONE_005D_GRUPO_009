// precios.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PlanFeature {
  name: string;
  description: string;
  price: number; // Precio en UF por característica
}

interface Plan {
  name: string;
  price: number; // Precio en UF
  features: string[];
  recommended?: boolean;
}

@Component({
  selector: 'app-precios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './precios.component.html',
  styleUrls: ['./precios.component.scss']
})
export class PreciosComponent {
  selectedTab: 'plans' | 'custom' = 'plans';
  employeeCount: number = 1;
  
  availableFeatures: PlanFeature[] = [
    { name: 'Gestión de Empleados', description: 'Administración básica de personal', price: 0.5 },
    { name: 'Gestión de Nómina', description: 'Cálculo y gestión de sueldos', price: 0.8 },
    { name: 'Portal del Empleado', description: 'Acceso para empleados', price: 0.3 },
    { name: 'Reclutamiento', description: 'Gestión de ofertas y postulaciones', price: 0.6 },
    { name: 'Reportes Avanzados', description: 'Análisis y estadísticas', price: 0.4 },
    { name: 'Evaluación de Desempeño', description: 'Sistema de evaluación', price: 0.5 }
  ];

  selectedFeatures: Set<string> = new Set();

  plans: Plan[] = [
    {
      name: 'Plan Gratuito',
      price: 0,
      features: [
        'Hasta 5 empleados',
        'Gestión básica de personal',
        'Portal del empleado básico',
        'Soporte por email'
      ]
    },
    {
      name: 'Plan Crecimiento',
      price: 0.91,
      recommended: true,
      features: [
        'Hasta 25 empleados',
        'Gestión completa de personal',
        'Portal del empleado avanzado',
        'Gestión de nómina',
        'Reclutamiento básico',
        'Soporte prioritario'
      ]
    },
    {
      name: 'Plan Empresa',
      price: 1.17,
      features: [
        'Empleados ilimitados',
        'Todas las características',
        'API personalizada',
        'Soporte 24/7',
        'Consultor dedicado',
        'Personalización avanzada'
      ]
    }
  ];

  calculateCustomPrice(): number {
    let basePrice = 1; // Precio base en UF
    this.selectedFeatures.forEach(feature => {
      const selectedFeature = this.availableFeatures.find(f => f.name === feature);
      if (selectedFeature) {
        basePrice += selectedFeature.price;
      }
    });
    return basePrice + (this.employeeCount * 0.1);
  }

  toggleFeature(feature: string): void {
    if (this.selectedFeatures.has(feature)) {
      this.selectedFeatures.delete(feature);
    } else {
      this.selectedFeatures.add(feature);
    }
  }

  switchTab(tab: 'plans' | 'custom'): void {
    this.selectedTab = tab;
  }
}