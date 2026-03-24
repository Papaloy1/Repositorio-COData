import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Reportes, Ubicaciones } from '../../models';

// Lazy import Leaflet to avoid build errors if not installed
let L: any;

interface ReporteConUbicacion extends Reportes {
  ubicacionData?: Ubicaciones;
  marker?: any;
}

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class MapaComponent implements OnInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  reportes: ReporteConUbicacion[] = [];
  filteredReportes: ReporteConUbicacion[] = [];
  selectedStatus: string = 'all';
  isLoading = true;
  error: string | null = null;
  expandedCards: Set<number> = new Set();
  map: any = null;
  markerClusterGroup: any = null;

  // Status configuration
  statusConfig = {
    critical: { label: 'Crítica', color: '#dc2626', icon: 'fa-exclamation-circle' },
    pending: { label: 'Pendiente', color: '#eab308', icon: 'fa-hourglass-half' },
    'in-process': { label: 'En Proceso', color: '#3b82f6', icon: 'fa-spinner' },
    completed: { label: 'Completado', color: '#16a34a', icon: 'fa-check-circle' },
  };

  statusOptions = [
    { value: 'all', label: 'Todos los reportes' },
    { value: 'critical', label: 'Críticos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'in-process', label: 'En Proceso' },
    { value: 'completed', label: 'Completados' },
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadReportes();
  }

  loadReportes(): void {
    this.isLoading = true;
    this.error = null;

    this.apiService.getReportes().subscribe({
      next: (reportes) => {
        this.reportes = reportes;
        this.applyFilters();
        this.initializeMap();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reportes:', error);
        this.error = 'Error al cargar los reportes. Intenta de nuevo.';
        this.isLoading = false;
        // Use mock data for demo
        this.loadMockData();
      },
    });
  }

  loadMockData(): void {
    // Mock data para demostración
    this.reportes = [
      {
        reporteId: 1,
        usuarioId: 1,
        categoriaId: 1,
        ubicacionId: 1,
        titulo: 'Fuga de agua en Av. Principal',
        descripcion: 'Fuga considerable en la tubería principal que afecta el suministro de agua potable',
        estado: 'critical',
        prioridad: 'Crítica',
        fecha_Creacion: new Date(),
        ubicacionData: {
          ubicacionId: 1,
          direccion: 'Av. Principal #123',
          ciudad: 'Centro',
          latitud: 18.4241,
          longitud: -69.9236,
        },
      },
      {
        reporteId: 2,
        usuarioId: 2,
        categoriaId: 2,
        ubicacionId: 2,
        titulo: 'Luminarias descompuestas',
        descripcion: 'Varias luminarias dañadas afectando la iluminación nocturna',
        estado: 'pending',
        prioridad: 'Media',
        fecha_Creacion: new Date(),
        ubicacionData: {
          ubicacionId: 2,
          direccion: 'Calle Secundaria #456',
          ciudad: 'Zona Norte',
          latitud: 18.4342,
          longitud: -69.9136,
        },
      },
      {
        reporteId: 3,
        usuarioId: 3,
        categoriaId: 3,
        ubicacionId: 3,
        titulo: 'Baches reparados exitosamente',
        descripcion: 'Los baches en esta zona han sido reparados correctamente',
        estado: 'completed',
        prioridad: 'Baja',
        fecha_Creacion: new Date(),
        ubicacionData: {
          ubicacionId: 3,
          direccion: 'Calle Principal #789',
          ciudad: 'Zona Sur',
          latitud: 18.4141,
          longitud: -69.9336,
        },
      },
    ];

    this.applyFilters();
    this.initializeMap();
  }

  applyFilters(): void {
    if (this.selectedStatus === 'all') {
      this.filteredReportes = [...this.reportes];
    } else {
      this.filteredReportes = this.reportes.filter(
        (r) => r.estado === this.selectedStatus
      );
    }

    // Update map markers
    if (this.map) {
      this.updateMapMarkers();
    }
  }

  toggleCard(reporteId: number): void {
    if (this.expandedCards.has(reporteId)) {
      this.expandedCards.delete(reporteId);
    } else {
      this.expandedCards.add(reporteId);
    }
  }

  isExpanded(reporteId: number): boolean {
    return this.expandedCards.has(reporteId);
  }

  getStatusClass(estado: string): string {
    return `status-${estado}`;
  }

  getStatusConfig(estado: string) {
    return (this.statusConfig as any)[estado] || this.statusConfig.pending;
  }

  initializeMap(): void {
    // Map initialization will happen after view renders
    setTimeout(() => {
      this.createLeafletMap();
    }, 100);
  }

  createLeafletMap(): void {
    if (!this.mapContainer) {
      return;
    }

    // Lazy load Leaflet
    try {
      L = require('leaflet');
    } catch (error) {
      console.error('Leaflet not installed. Install with: npm install leaflet');
      return;
    }

    // Destroy existing map if any
    if (this.map) {
      this.map.remove();
    }

    // Default center (Dominican Republic)
    const defaultCenter: [number, number] = [18.4241, -69.9236];

    // Create map
    this.map = L.map(this.mapContainer.nativeElement, {
      center: defaultCenter,
      zoom: 13,
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        }),
      ],
    });

    // Create marker cluster group
    this.markerClusterGroup = L.featureGroup();
    this.map.addLayer(this.markerClusterGroup);

    // Add markers for filtered reportes
    this.updateMapMarkers();
  }

  updateMapMarkers(): void {
    if (!this.markerClusterGroup || !this.map) {
      return;
    }

    // Clear existing markers
    this.markerClusterGroup.clearLayers();

    // Add markers for filtered reportes
    this.filteredReportes.forEach((reporte) => {
      if (reporte.ubicacionData) {
        const { latitud, longitud } = reporte.ubicacionData;
        const statusConfig = this.getStatusConfig(reporte.estado);

        // Create custom icon
        const iconColor = statusConfig.color;
        const customIcon = L.divIcon({
          html: `<div style="background-color: ${iconColor}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                  <i class="fas ${statusConfig.icon}" style="font-size: 16px;"></i>
                </div>`,
          className: 'custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15],
        });

        // Create marker
        const marker = L.marker([latitud, longitud], {
          icon: customIcon,
          title: reporte.titulo,
        });

        // Bind popup
        const popupContent = `
          <div style="font-family: Montserrat, sans-serif; width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: ${iconColor};">${reporte.titulo}</h4>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Estado:</strong> ${statusConfig.label}
            </p>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Prioridad:</strong> ${reporte.prioridad}
            </p>
            <p style="margin: 4px 0; font-size: 12px;">
              ${reporte.ubicacionData.direccion}, ${reporte.ubicacionData.ciudad}
            </p>
          </div>
        `;
        marker.bindPopup(popupContent);

        // Add to cluster group
        this.markerClusterGroup.addLayer(marker);
        reporte.marker = marker;
      }
    });

    // Fit bounds if markers exist
    if (this.filteredReportes.length > 0) {
      const bounds = this.markerClusterGroup.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }

  viewMapLocation(reporte: ReporteConUbicacion): void {
    if (reporte.ubicacionData && this.map) {
      const { latitud, longitud } = reporte.ubicacionData;
      this.map.setView([latitud, longitud], 16);

      // Abre popup si existe marker
      if (reporte.marker) {
        reporte.marker.openPopup();
      }
    }
  }

  updateReporte(reporte: ReporteConUbicacion): void {
    console.log('Updating reporte:', reporte);
    // TODO: Implement update logic
  }

  deleteReporte(reporteId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      this.apiService.eliminarReporte(reporteId).subscribe({
        next: () => {
          this.reportes = this.reportes.filter((r) => r.reporteId !== reporteId);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting reporte:', error);
          alert('Error al eliminar el reporte');
        },
      });
    }
  }
}
