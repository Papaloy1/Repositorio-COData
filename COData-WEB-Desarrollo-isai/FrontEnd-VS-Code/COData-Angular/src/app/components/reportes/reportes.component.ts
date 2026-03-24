import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Reportes, Categorias, Ubicaciones } from '../../models';

interface ReporteWithRelations extends Reportes {
  usuarioNombre?: string;
  categoriaNombre?: string;
  ubicacionDireccion?: string;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

type SortField = 'fecha_Creacion' | 'titulo' | 'prioridad' | 'estado';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class ReportesComponent implements OnInit, OnDestroy {
  // Data properties
  reportes: ReporteWithRelations[] = [];
  filteredReportes: ReporteWithRelations[] = [];
  displayedReportes: ReporteWithRelations[] = [];
  categorias: Categorias[] = [];
  ubicaciones: Ubicaciones[] = [];

  // UI state
  isLoading = true;
  isLoadingMore = false;
  error: string | null = null;
  selectedReporte: ReporteWithRelations | null = null;
  expandedCards: Set<number> = new Set();
  viewMode: 'grid' | 'list' | 'table' = 'grid';

  // Filtering and sorting
  filterForm!: FormGroup;
  searchTerm$ = new Subject<string>();
  currentSearchTerm = '';
  selectedCategory: number | null = null;
  selectedStatus: string = 'all';
  selectedPriority: string = 'all';
  sortField: SortField = 'fecha_Creacion';
  sortDirection: SortDirection = 'desc';

  // Pagination
  pagination: PaginationState = {
    currentPage: 1,
    pageSize: 9,
    totalItems: 0,
    totalPages: 0,
  };

  // Status and priority configuration
  statusConfig = {
    abierto: { label: 'Abierto', color: '#3b82f6', icon: 'fa-folder-open', badge: 'info' },
    pendiente: { label: 'Pendiente', color: '#eab308', icon: 'fa-hourglass-half', badge: 'warning' },
    'en-proceso': { label: 'En Proceso', color: '#8b5cf6', icon: 'fa-spinner', badge: 'primary' },
    resuelto: { label: 'Resuelto', color: '#16a34a', icon: 'fa-check-circle', badge: 'success' },
    cerrado: { label: 'Cerrado', color: '#6b7280', icon: 'fa-lock', badge: 'secondary' },
  };

  priorityConfig = {
    baja: { label: 'Baja', color: '#10b981', severity: 'low' },
    media: { label: 'Media', color: '#f59e0b', severity: 'medium' },
    alta: { label: 'Alta', color: '#ef4444', severity: 'high' },
    crítica: { label: 'Crítica', color: '#7c2d12', severity: 'critical' },
  };

  statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'abierto', label: 'Abierto' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en-proceso', label: 'En Proceso' },
    { value: 'resuelto', label: 'Resuelto' },
    { value: 'cerrado', label: 'Cerrado' },
  ];

  priorityOptions = [
    { value: 'all', label: 'Todas las prioridades' },
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'crítica', label: 'Crítica' },
  ];

  sortOptions = [
    { value: 'fecha_Creacion', label: 'Fecha (más reciente)' },
    { value: 'titulo', label: 'Título (A-Z)' },
    { value: 'prioridad', label: 'Prioridad' },
    { value: 'estado', label: 'Estado' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadReportes();
    this.loadCategorias();
    this.loadUbicaciones();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize reactive form for filters
   */
  private initializeForm(): void {
    this.filterForm = this.formBuilder.group({
      searchInput: [''],
      category: [null],
      status: ['all'],
      priority: ['all'],
    });
  }

  /**
   * Setup search with debounce
   */
  private setupSearch(): void {
    this.searchTerm$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        this.currentSearchTerm = searchTerm;
        this.pagination.currentPage = 1;
        this.applyFilters();
      });
  }

  /**
   * Load all reportes from API
   */
  loadReportes(): void {
    this.isLoading = true;
    this.error = null;

    this.apiService
      .getReportes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reportes) => {
          this.reportes = reportes;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading reportes:', error);
          this.error = 'Error al cargar los reportes. Por favor, intenta de nuevo.';
          this.isLoading = false;
          this.loadMockData();
        },
      });
  }

  /**
   * Load categories for filter dropdown
   */
  loadCategorias(): void {
    this.apiService
      .getCategorias()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categorias) => {
          this.categorias = categorias;
        },
        error: (error) => {
          console.error('Error loading categorias:', error);
        },
      });
  }

  /**
   * Load ubicaciones for reference
   */
  loadUbicaciones(): void {
    this.apiService
      .getUbicaciones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ubicaciones) => {
          this.ubicaciones = ubicaciones;
        },
        error: (error) => {
          console.error('Error loading ubicaciones:', error);
        },
      });
  }

  /**
   * Load mock data for demo
   */
  private loadMockData(): void {
    this.reportes = [
      {
        reporteId: 1,
        usuarioId: 1,
        categoriaId: 1,
        ubicacionId: 1,
        titulo: 'Fuga de agua en Av. Principal',
        descripcion: 'Fuga considerable en la tubería principal que afecta el suministro de agua potable a más de 500 hogares',
        estado: 'en-proceso',
        prioridad: 'crítica',
        fecha_Creacion: new Date('2026-03-15'),
        fecha_Cierre: undefined,
        usuarioNombre: 'Juan Pérez',
        categoriaNombre: 'Infraestructura',
        ubicacionDireccion: 'Av. Principal #123',
      },
      {
        reporteId: 2,
        usuarioId: 2,
        categoriaId: 2,
        ubicacionId: 2,
        titulo: 'Señal débil en zona norte',
        descripcion: 'La cobertura de señal es muy débil en la zona norte de la ciudad',
        estado: 'pendiente',
        prioridad: 'media',
        fecha_Creacion: new Date('2026-03-18'),
        usuarioNombre: 'María García',
        categoriaNombre: 'Comunicación',
        ubicacionDireccion: 'Calle Norte #456',
      },
      {
        reporteId: 3,
        usuarioId: 3,
        categoriaId: 1,
        ubicacionId: 3,
        titulo: 'Daño en vía por tremor',
        descripcion: 'Se reportan grietas en el asfalto causadas por el último movimiento telúrico',
        estado: 'abierto',
        prioridad: 'alta',
        fecha_Creacion: new Date('2026-03-20'),
        usuarioNombre: 'Carlos López',
        categoriaNombre: 'Vialidad',
        ubicacionDireccion: 'Av. Secundaria #789',
      },
    ];
    this.applyFilters();
  }

  /**
   * Apply all active filters and sorting
   */
  applyFilters(): void {
    let filtered = [...this.reportes];

    // Search filter
    if (this.currentSearchTerm) {
      const term = this.currentSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.titulo.toLowerCase().includes(term) ||
          r.descripcion.toLowerCase().includes(term) ||
          r.usuarioNombre?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter((r) => r.categoriaId === this.selectedCategory);
    }

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((r) => r.estado === this.selectedStatus);
    }

    // Priority filter
    if (this.selectedPriority !== 'all') {
      filtered = filtered.filter((r) => r.prioridad === this.selectedPriority);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[this.sortField];
      let bVal: any = b[this.sortField];

      if (this.sortField === 'fecha_Creacion') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (this.sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    this.filteredReportes = filtered;
    this.pagination.totalItems = filtered.length;
    this.pagination.totalPages = Math.ceil(filtered.length / this.pagination.pageSize);
    this.pagination.currentPage = 1;
    this.updateDisplayedReportes();
  }

  /**
   * Update displayed reportes based on pagination
   */
  updateDisplayedReportes(): void {
    const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
    const end = start + this.pagination.pageSize;
    this.displayedReportes = this.filteredReportes.slice(start, end);
  }

  /**
   * Handle search input
   */
  onSearchChange(value: string): void {
    this.searchTerm$.next(value);
  }

  /**
   * Handle category filter change
   */
  onCategoryChange(event: any): void {
    this.selectedCategory = event.target.value ? parseInt(event.target.value) : null;
    this.pagination.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Handle status filter change
   */
  onStatusChange(event: any): void {
    this.selectedStatus = event.target.value;
    this.pagination.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Handle priority filter change
   */
  onPriorityChange(event: any): void {
    this.selectedPriority = event.target.value;
    this.pagination.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Handle sort change
   */
  onSortChange(event: any): void {
    this.sortField = event.target.value as SortField;
    this.applyFilters();
  }

  /**
   * Toggle sort direction
   */
  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterForm.reset();
    this.currentSearchTerm = '';
    this.selectedCategory = null;
    this.selectedStatus = 'all';
    this.selectedPriority = 'all';
    this.sortField = 'fecha_Creacion';
    this.sortDirection = 'desc';
    this.pagination.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Change pagination page
   */
  goToPage(event: Event | number): void {
    let page: number;
    if (typeof event === 'number') {
      page = event;
    } else {
      page = parseInt((event.target as HTMLInputElement).value, 10);
    }
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pagination.currentPage = page;
      this.updateDisplayedReportes();
      this.scrollToTop();
    }
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.pagination.currentPage < this.pagination.totalPages) {
      this.goToPage(this.pagination.currentPage + 1);
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    if (this.pagination.currentPage > 1) {
      this.goToPage(this.pagination.currentPage - 1);
    }
  }

  /**
   * Change page size
   */
  changePageSize(event: Event | number): void {
    let size: number;
    if (typeof event === 'number') {
      size = event;
    } else {
      size = parseInt((event.target as HTMLSelectElement).value, 10);
    }
    this.pagination.pageSize = size;
    this.pagination.totalPages = Math.ceil(this.filteredReportes.length / size);
    this.pagination.currentPage = 1;
    this.updateDisplayedReportes();
  }

  /**
   * Toggle card expansion
   */
  toggleCardExpand(reporteId: number): void {
    if (this.expandedCards.has(reporteId)) {
      this.expandedCards.delete(reporteId);
    } else {
      this.expandedCards.add(reporteId);
    }
  }

  /**
   * Select or deselect a reporte
   */
  selectReporte(reporte: ReporteWithRelations): void {
    this.selectedReporte = this.selectedReporte?.reporteId === reporte.reporteId ? null : reporte;
  }

  /**
   * Change view mode
   */
  changeViewMode(mode: 'grid' | 'list' | 'table'): void {
    this.viewMode = mode;
    this.expandedCards.clear();
  }

  /**
   * View reporte details
   */
  viewReporteDetails(reporteId: number): void {
    // Navigate to detail view or open modal
    console.log('View reporte:', reporteId);
    // TODO: Implement navigation to detail page or modal
  }

  /**
   * Edit reporte
   */
  editReporte(reporteId: number): void {
    // Navigate to edit form
    console.log('Edit reporte:', reporteId);
    // TODO: Implement navigation to edit page or modal
  }

  /**
   * Delete reporte
   */
  deleteReporte(reporteId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      this.apiService
        .eliminarReporte(reporteId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadReportes();
          },
          error: (error) => {
            console.error('Error deleting reporte:', error);
            alert('Error al eliminar el reporte');
          },
        });
    }
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(estado: string): string {
    const config = this.statusConfig[estado as keyof typeof this.statusConfig];
    return config?.badge || 'secondary';
  }

  /**
   * Get priority color
   */
  getPriorityColor(prioridad: string): string {
    const config = this.priorityConfig[prioridad.toLowerCase() as keyof typeof this.priorityConfig];
    return config?.color || '#6b7280';
  }

  /**
   * Get status config
   */
  getStatusConfig(estado: string | undefined): { label: string; color: string; icon: string; badge: string } {
    if (!estado) return { label: 'Desconocido', color: '#999', icon: 'fa-circle', badge: 'secondary' };
    return this.statusConfig[estado.toLowerCase() as keyof typeof this.statusConfig] || { label: estado, color: '#999', icon: 'fa-circle', badge: 'secondary' };
  }

  /**
   * Get duration since creation
   */
  getDurationSinceCreation(fecha: Date): string {
    const now = new Date();
    const createdDate = new Date(fecha);
    const diffMs = now.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `Hace ${diffDays}d`;
    } else if (diffHours > 0) {
      return `Hace ${diffHours}h`;
    } else {
      return 'Hace poco';
    }
  }

  /**
   * Scroll to top
   */
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Get pagination array for template
   */
  get paginationArray(): number[] {
    const pages = [];
    const maxPages = Math.min(5, this.pagination.totalPages);
    let startPage = Math.max(1, this.pagination.currentPage - Math.floor(maxPages / 2));
    
    if (startPage + maxPages - 1 > this.pagination.totalPages) {
      startPage = Math.max(1, this.pagination.totalPages - maxPages + 1);
    }

    for (let i = 0; i < maxPages; i++) {
      pages.push(startPage + i);
    }

    return pages;
  }
}
