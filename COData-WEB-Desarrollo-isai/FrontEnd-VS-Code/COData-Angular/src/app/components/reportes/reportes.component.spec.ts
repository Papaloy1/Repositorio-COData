import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ReportesComponent } from './reportes.component';
import { ApiService } from '../../services/api.service';
import { Reportes, Categorias, Ubicaciones } from '../../models';

describe('ReportesComponent', () => {
  let component: ReportesComponent;
  let fixture: ComponentFixture<ReportesComponent>;
  let apiService: Partial<ApiService>;

  // Mock data
  const mockReportes: Reportes[] = [
    {
      reporteId: 1,
      usuarioId: 1,
      categoriaId: 1,
      ubicacionId: 1,
      titulo: 'Test Report 1',
      descripcion: 'Description 1',
      estado: 'abierto',
      prioridad: 'alta',
      fecha_Creacion: new Date('2026-03-20'),
    },
    {
      reporteId: 2,
      usuarioId: 2,
      categoriaId: 2,
      ubicacionId: 2,
      titulo: 'Test Report 2',
      descripcion: 'Description 2',
      estado: 'pendiente',
      prioridad: 'media',
      fecha_Creacion: new Date('2026-03-21'),
    },
  ];

  const mockCategorias: Categorias[] = [
    { categoriaId: 1, nombreCategoria: 'Infraestructura', descripcion: 'Test' },
    { categoriaId: 2, nombreCategoria: 'Comunicación', descripcion: 'Test' },
  ];

  const mockUbicaciones: Ubicaciones[] = [
    {
      ubicacionId: 1,
      direccion: 'Calle 1',
      ciudad: 'Ciudad 1',
      latitud: 0,
      longitud: 0,
    },
  ];

  beforeEach(async () => {
    const apiServiceMock: Partial<ApiService> = {
      getReportes: vi.fn().mockReturnValue(of(mockReportes)),
      getCategorias: vi.fn().mockReturnValue(of(mockCategorias)),
      getUbicaciones: vi.fn().mockReturnValue(of(mockUbicaciones)),
      eliminarReporte: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [ReportesComponent, CommonModule, ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: apiServiceMock }],
    }).compileComponents();

    apiService = TestBed.inject(ApiService);

    fixture = TestBed.createComponent(ReportesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty controls', () => {
      expect(component.filterForm).toBeTruthy();
      expect(component.filterForm.get('searchInput')).toBeTruthy();
    });

    it('should set default values on init', () => {
      expect(component.viewMode).toBe('grid');
      expect(component.selectedStatus).toBe('all');
      expect(component.selectedPriority).toBe('all');
      expect(component.sortField).toBe('fecha_Creacion');
      expect(component.sortDirection).toBe('desc');
    });

    it('should load data on ngOnInit', () => {
      fixture.detectChanges();

      expect(apiService.getReportes).toHaveBeenCalled();
      expect(apiService.getCategorias).toHaveBeenCalled();
      expect(apiService.getUbicaciones).toHaveBeenCalled();
    });

    it('should populate reportes from API response', () => {
      fixture.detectChanges();

      expect(component.reportes.length).toBe(2);
      expect(component.reportes[0].titulo).toBe('Test Report 1');
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      component.reportes = mockReportes;
    });

    it('should filter by status', () => {
      component.selectedStatus = 'abierto';
      component.applyFilters();

      const filtered = component.filteredReportes.filter(
        (r) => r.estado === 'abierto'
      );
      expect(filtered.length).toBe(1);
      expect(filtered[0].reporteId).toBe(1);
    });

    it('should filter by priority', () => {
      component.selectedPriority = 'media';
      component.applyFilters();

      expect(
        component.filteredReportes.every((r) => r.prioridad === 'media')
      ).toBe(true);
    });

    it('should filter by category', () => {
      component.selectedCategory = 1;
      component.applyFilters();

      expect(
        component.filteredReportes.every((r) => r.categoriaId === 1)
      ).toBe(true);
    });

    it('should search text in title and description', () => {
      component.currentSearchTerm = 'Test Report 1';
      component.applyFilters();

      expect(component.filteredReportes.length).toBeGreaterThan(0);
      expect(
        component.filteredReportes.some((r) => r.titulo.includes('Test Report 1'))
      ).toBe(true);
    });

    it('should clear all filters', () => {
      component.selectedStatus = 'abierto';
      component.selectedPriority = 'alta';
      component.selectedCategory = 1;
      component.currentSearchTerm = 'test';

      component.clearFilters();

      expect(component.selectedStatus).toBe('all');
      expect(component.selectedPriority).toBe('all');
      expect(component.selectedCategory).toBeNull();
      expect(component.currentSearchTerm).toBe('');
      expect(component.filteredReportes.length).toBe(2);
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      component.reportes = [...mockReportes];
    });

    it('should sort by titulo ascending', () => {
      component.sortField = 'titulo';
      component.sortDirection = 'asc';
      component.applyFilters();

      const titles = component.filteredReportes.map((r) => r.titulo);
      expect(titles[0]).toBe('Test Report 1');
      expect(titles[1]).toBe('Test Report 2');
    });

    it('should sort by fecha_Creacion descending', () => {
      component.sortField = 'fecha_Creacion';
      component.sortDirection = 'desc';
      component.applyFilters();

      const dates = component.filteredReportes.map((r) => r.fecha_Creacion);
      for (let i = 0; i < dates.length - 1; i++) {
        expect(
          new Date(dates[i]).getTime() >= new Date(dates[i + 1]).getTime()
        ).toBe(true);
      }
    });

    it('should toggle sort direction', () => {
      const initialDirection = component.sortDirection;
      component.toggleSortDirection();

      expect(component.sortDirection).not.toBe(initialDirection);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      component.reportes = mockReportes;
      component.applyFilters();
    });

    it('should calculate total pages correctly', () => {
      component.pagination.pageSize = 1;
      component.applyFilters();

      expect(component.pagination.totalPages).toBe(2);
    });

    it('should update displayed reportes for current page', () => {
      component.pagination.pageSize = 1;
      component.pagination.currentPage = 1;
      component.updateDisplayedReportes();

      expect(component.displayedReportes.length).toBe(1);
      expect(component.displayedReportes[0].reporteId).toBe(1);
    });

    it('should navigate to next page', () => {
      component.pagination.pageSize = 1;
      component.applyFilters();
      component.nextPage();

      expect(component.pagination.currentPage).toBe(2);
    });

    it('should navigate to previous page', () => {
      component.pagination.pageSize = 1;
      component.applyFilters();
      component.pagination.currentPage = 2;
      component.previousPage();

      expect(component.pagination.currentPage).toBe(1);
    });

    it('should not go beyond total pages', () => {
      component.pagination.pageSize = 2;
      component.applyFilters();
      component.nextPage();

      expect(component.pagination.currentPage).toBeLessThanOrEqual(
        component.pagination.totalPages
      );
    });

    it('should change page size', () => {
      component.changePageSize(15);

      expect(component.pagination.pageSize).toBe(15);
    });
  });

  describe('View Mode', () => {
    it('should change view mode to list', () => {
      component.changeViewMode('list');

      expect(component.viewMode).toBe('list');
    });

    it('should change view mode to table', () => {
      component.changeViewMode('table');

      expect(component.viewMode).toBe('table');
    });

    it('should clear expanded cards when changing view', () => {
      component.expandedCards.add(1);
      component.expandedCards.add(2);

      component.changeViewMode('list');

      expect(component.expandedCards.size).toBe(0);
    });
  });

  describe('Card Operations', () => {
    beforeEach(() => {
      component.reportes = mockReportes;
    });

    it('should toggle card expansion', () => {
      component.toggleCardExpand(1);

      expect(component.expandedCards.has(1)).toBe(true);

      component.toggleCardExpand(1);

      expect(component.expandedCards.has(1)).toBe(false);
    });

    it('should select reporte', () => {
      const reporte = mockReportes[0];
      component.selectReporte(reporte);

      expect(component.selectedReporte).toBe(reporte);
    });

    it('should deselect reporte by clicking again', () => {
      const reporte = mockReportes[0];
      component.selectReporte(reporte);
      component.selectReporte(reporte);

      expect(component.selectedReporte).toBeNull();
    });
  });

  describe('Delete Operations', () => {
    beforeEach(() => {
      component.reportes = mockReportes;
    });

    it('should delete reporte with confirmation', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      component.deleteReporte(1);

      expect(apiService.eliminarReporte).toHaveBeenCalledWith(1);
      confirmSpy.mockRestore();
    });

    it('should not delete reporte without confirmation', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      component.deleteReporte(1);

      expect(apiService.eliminarReporte).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });
  });

  describe('Helper Methods', () => {
    it('should get correct badge class for status', () => {
      const badgeClass = component.getStatusBadgeClass('abierto');

      expect(badgeClass).toBe('info');
    });

    it('should get color for priority', () => {
      const color = component.getPriorityColor('alta');

      expect(color).toBeTruthy();
    });

    it('should format duration since creation', () => {
      const now = new Date();
      const duration = component.getDurationSinceCreation(now);

      expect(duration).toContain('Hace');
    });

    it('should generate pagination array', () => {
      component.pagination.currentPage = 1;
      component.pagination.totalPages = 10;

      const array = component.paginationArray;

      expect(array.length).toBeGreaterThan(0);
      expect(array.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle API error gracefully', () => {
      (apiService.getReportes as any) = vi.fn().mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      fixture.detectChanges();

      expect(component.error).toBeTruthy();
      expect(component.isLoading).toBe(false);
    });

    it('should load mock data on API error', () => {
      (apiService.getReportes as any) = vi.fn().mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      fixture.detectChanges();

      expect(component.reportes.length).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      component.reportes = mockReportes;
    });

    it('should trigger search on input change', async () => {
      component.onSearchChange('Test Report 1');

      await new Promise(resolve => setTimeout(resolve, 400)); // Wait for debounce

      expect(component.currentSearchTerm).toBe('Test Report 1');
      expect(component.filteredReportes.length).toBeGreaterThan(0);
    });

    it('should be case insensitive in search', async () => {
      component.onSearchChange('test report');

      await new Promise(resolve => setTimeout(resolve, 400));

      expect(component.filteredReportes.length).toBeGreaterThan(0);
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      fixture.detectChanges();
      const nextSpy = vi.spyOn(component['destroy$'], 'next');
      const completeSpy = vi.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
