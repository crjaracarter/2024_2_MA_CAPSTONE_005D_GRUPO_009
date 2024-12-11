import { Component, Input, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-attendance-map',
  templateUrl: './attendance-map.component.html',
  styleUrls: ['./attendance-map.component.scss']
})
export class AttendanceMapComponent implements AfterViewInit {
  @Input() latitude: number = 0;
  @Input() longitude: number = 0;
  @Input() accuracy: number = 0;
  private map: L.Map | null = null;

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map').setView([this.latitude, this.longitude], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const marker = L.marker([this.latitude, this.longitude]).addTo(this.map);
    
    L.circle([this.latitude, this.longitude], {
      color: '#4B0082',
      fillColor: '#5A4FCF',
      fillOpacity: 0.2,
      radius: this.accuracy
    }).addTo(this.map);

    marker.bindPopup(`
      <b>Tu ubicación</b><br>
      Precisión: ${Math.round(this.accuracy)} metros
    `).openPopup();
  }
}