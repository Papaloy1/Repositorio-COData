import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Reportes } from '../../models';

interface ExpandedCard {
  [key: number]: boolean;
}

/**
 * Seguimiento Component - Report Tracking Interface
 * Displays user-submitted reports with status tracking and expandable details
 */
@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.scss'],
})
export class SeguimientoComponent implements OnInit, OnDestroy {
  reportes: Reportes[] = [];
  filteredReportes: Reportes[] = [];
  expandedCards: ExpandedCard = {};
  searchForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  currentSearchTerm = '';

  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      searchInput: '',
    });
  }

  ngOnInit(): void {
    this.loadReportes();
    this.setupSearchListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load reports from API
   */
  loadReportes(): void {
    this.isLoading = true;
    this.error = null;

    this.apiService
      .getReportes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.reportes = data;
          this.filteredReportes = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading reports:', err);
          this.error = 'Error al cargar los reportes. Por favor, intente más tarde.';
          this.isLoading = false;
          // Load mock data on error
          this.loadMockData();
        },
      });
  }

  /**
   * Load mock data as fallback
   */
  loadMockData(): void {
    const mockReports: Reportes[] = [
      {
        reporteId: 1,
        usuarioId: 1,
        categoriaId: 1,
        ubicacionId: 1,
        titulo: 'Fuga de agua en Av. Principal',
        descripcion:
          'Se ha detectado una fuga significativa de agua en la Avenida Principal, esquina con Calle 5.',
        estado: 'en-proceso',
        prioridad: 'crítica',
        fecha_Creacion: new Date('2026-03-15'),
      },
      {
        reporteId: 2,
        usuarioId: 2,
        categoriaId: 2,
        ubicacionId: 2,
        titulo: 'Alumbrado público defectuoso',
        descripcion: 'Las luces de la calle 8 no han funcionado durante los últimos 3 días.',
        estado: 'pendiente',
        prioridad: 'alta',
        fecha_Creacion: new Date('2026-03-18'),
      },
      {
        reporteId: 3,
        usuarioId: 3,
        categoriaId: 1,
        ubicacionId: 3,
        titulo: 'Bache en la ruta de transporte',
        descripcion: 'Bache profundo que afecta el transporte público diario.',
        estado: 'resuelto',
        prioridad: 'media',
        fecha_Creacion: new Date('2026-03-10'),
      },
      {
        reporteId: 4,
        usuarioId: 1,
        categoriaId: 3,
        ubicacionId: 1,
        titulo: 'Recolección de basura incompleta',
        descripcion: 'El servicio no completó la recolección en el sector 5 esta semana.',
        estado: 'abierto',
        prioridad: 'baja',
        fecha_Creacion: new Date('2026-03-20'),
      },
    ];
    this.reportes = mockReports;
    this.filteredReportes = mockReports;
  }

  /**
   * Setup search functionality with debounce
   */
  setupSearchListener(): void {
    this.searchForm
      .get('searchInput')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        this.onSearchChange(searchTerm);
      });
  }

  /**
   * Handle search input change
   */
  onSearchChange(searchTerm: string): void {
    this.currentSearchTerm = searchTerm;
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredReportes = this.reportes;
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredReportes = this.reportes.filter(
        (reporte) =>
          reporte.titulo.toLowerCase().includes(term) ||
          reporte.descripcion.toLowerCase().includes(term) ||
          reporte.estado.toLowerCase().includes(term)
      );
    }
  }

  /**
   * Toggle card expansion
   */
  toggleCard(index: number): void {
    this.expandedCards[index] = !this.expandedCards[index];
  }

  /**
   * Check if card is expanded
   */
  isCardExpanded(index: number): boolean {
    return this.expandedCards[index] || false;
  }

  /**
   * Get status badge configuration
   */
  getStatusConfig(estado: string | undefined): { label: string; color: string; borderColor: string } {
    const statusMap: {
      [key: string]: { label: string; color: string; borderColor: string };
    } = {
      abierto: {
        label: 'Abierto',
        color: '#f3f4f6',
        borderColor: '#3b82f6',
      },
      pendiente: {
        label: 'Pendiente',
        color: '#fffbeb',
        borderColor: '#eab308',
      },
      'en-proceso': {
        label: 'En Proceso',
        color: '#fef3c7',
        borderColor: '#f59e0b',
      },
      resuelto: {
        label: 'Resuelto',
        color: '#e8f5e9',
        borderColor: '#16a34a',
      },
      cerrado: {
        label: 'Cerrado',
        color: '#f3f4f6',
        borderColor: '#6b7280',
      },
    };

    const status = estado?.toLowerCase() || 'abierto';
    return statusMap[status] || statusMap['abierto'];
  }

  /**
   * Get priority color
   */
  getPriorityColor(prioridad: string | undefined): string {
    const priorityColors: { [key: string]: string } = {
      crítica: '#dc2626',
      alta: '#f97316',
      media: '#eab308',
      baja: '#16a34a',
    };

    return priorityColors[prioridad?.toLowerCase() || 'media'] || '#6b7280';
  }

  /**
   * Get priority label
   */
  getPriorityLabel(prioridad: string | undefined): string {
    const labels: { [key: string]: string } = {
      crítica: 'Crítica',
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja',
    };

    return labels[prioridad?.toLowerCase() || 'media'] || prioridad || 'Media';
  }

  /**
   * Get time duration since report creation
   */
  getDurationSinceCreation(fecha: Date | undefined): string {
    if (!fecha) return 'Desconocida';

    const now = new Date();
    const createdDate = new Date(fecha);
    const diffMs = now.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `Hace ${diffDays}d`;
    } else if (diffHours > 0) {
      return `Hace ${diffHours}h`;
    } else if (diffMinutes > 0) {
      return `Hace ${diffMinutes}m`;
    } else {
      return 'Hace poco';
    }
  }

  /**
   * Update report action
   */
  updateReport(reporteId: number): void {
    console.log('Updating report:', reporteId);
    // TODO: Implement update functionality
  }

  /**
   * View report on map
   */
  viewOnMap(reporteId: number): void {
    console.log('Viewing report on map:', reporteId);
    // TODO: Navigate to map component with report
  }

  /**
   * Delete report
   */
  deleteReport(reporteId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      this.isLoading = true;
      this.apiService
        .eliminarReporte(reporteId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.reportes = this.reportes.filter((r) => r.reporteId !== reporteId);
            this.filteredReportes = this.filteredReportes.filter(
              (r) => r.reporteId !== reporteId
            );
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error deleting report:', err);
            this.error = 'Error al eliminar el reporte. Por favor, intente más tarde.';
            this.isLoading = false;
          },
        });
    }
  }

  /**
   * Scroll to top of page
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
