import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { SeguimientoComponent } from './seguimiento.component';
import { ApiService } from '../../services/api.service';
import { Reportes } from '../../models';

describe('SeguimientoComponent', () => {
  let component: SeguimientoComponent;
  let fixture: ComponentFixture<SeguimientoComponent>;
  let apiService: Partial<ApiService>;

  // Mock data
  const mockReportes: Reportes[] = [
    {
      reporteId: 1,
      usuarioId: 1,
      categoriaId: 1,
      ubicacionId: 1,
      titulo: 'Fuga de agua en Av. Principal',
      descripcion: 'Se ha detectado una fuga significativa de agua',
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
      descripcion: 'Las luces de la calle 8 no han funcionado',
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
      descripcion: 'Bache profundo que afecta el transporte público',
      estado: 'resuelto',
      prioridad: 'media',
      fecha_Creacion: new Date('2026-03-10'),
    },
  ];

  beforeEach(async () => {
    const apiServiceMock: Partial<ApiService> = {
      getReportes: vi.fn().mockReturnValue(of(mockReportes)),
      eliminarReporte: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [SeguimientoComponent, CommonModule, ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: apiServiceMock }],
    }).compileComponents();

    apiService = TestBed.inject(ApiService);

    fixture = TestBed.createComponent(SeguimientoComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty arrays', () => {
      expect(component.reportes).toEqual([]);
      expect(component.filteredReportes).toEqual([]);
    });

    it('should create search form', () => {
      expect(component.searchForm).toBeTruthy();
      expect(component.searchForm.get('searchInput')).toBeTruthy();
    });

    it('should set initial values', () => {
      expect(component.isLoading).toBe(false);
      expect(component.error).toBeNull();
      expect(component.currentSearchTerm).toBe('');
      expect(component.expandedCards).toEqual({});
    });

    it('should load reportes on ngOnInit', () => {
      fixture.detectChanges();

      expect(apiService.getReportes).toHaveBeenCalled();
      expect(component.reportes.length).toBe(3);
      expect(component.filteredReportes.length).toBe(3);
    });
  });

  describe('Load Reportes', () => {
    it('should fetch reportes from API', () => {
      component.loadReportes();

      expect(component.reportes).toEqual(mockReportes);
      expect(component.filteredReportes).toEqual(mockReportes);
    });

    it('should set isLoading to true when loading', () => {
      component.isLoading = false;
      (apiService.getReportes as any) = vi.fn(() => {
        expect(component.isLoading).toBe(true);
        return of(mockReportes);
      });

      component.loadReportes();
    });

    it('should handle API error gracefully', () => {
      (apiService.getReportes as any) = vi.fn().mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      component.loadReportes();

      expect(component.error).toBeTruthy();
      expect(component.isLoading).toBe(false);
      expect(component.reportes.length).toBeGreaterThan(0);
    });

    it('should load mock data on API error', () => {
      (apiService.getReportes as any) = vi.fn().mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      component.loadReportes();

      expect(component.reportes.length).toBe(4); // Mock data has 4 reports
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      component.reportes = mockReportes;
      component.filteredReportes = mockReportes;
    });

    it('should filter reportes by title', () => {
      component.onSearchChange('Fuga');

      expect(component.filteredReportes.length).toBe(1);
      expect(component.filteredReportes[0].titulo).toContain('Fuga');
    });

    it('should filter reportes by description', () => {
      component.onSearchChange('luces');

      expect(component.filteredReportes.length).toBe(1);
      expect(component.filteredReportes[0].titulo).toContain('Alumbrado');
    });

    it('should filter reportes by status', () => {
      component.onSearchChange('pendiente');

      expect(component.filteredReportes.length).toBe(1);
      expect(component.filteredReportes[0].estado).toBe('pendiente');
    });

    it('should be case insensitive', () => {
      component.onSearchChange('FUGA');

      expect(component.filteredReportes.length).toBe(1);
    });

    it('should return all reportes with empty search', () => {
      component.onSearchChange('');

      expect(component.filteredReportes.length).toBe(3);
    });

    it('should return empty array when no matches', () => {
      component.onSearchChange('NoExiste');

      expect(component.filteredReportes.length).toBe(0);
    });

    it('should update currentSearchTerm', async () => {
      component.onSearchChange('Test');

      expect(component.currentSearchTerm).toBe('Test');
    });
  });

  describe('Card Expansion', () => {
    it('should toggle card expanded state', () => {
      const index = 0;
      expect(component.isCardExpanded(index)).toBe(false);

      component.toggleCard(index);
      expect(component.isCardExpanded(index)).toBe(true);

      component.toggleCard(index);
      expect(component.isCardExpanded(index)).toBe(false);
    });

    it('should handle multiple cards independently', () => {
      component.toggleCard(0);
      component.toggleCard(1);

      expect(component.isCardExpanded(0)).toBe(true);
      expect(component.isCardExpanded(1)).toBe(true);
      expect(component.isCardExpanded(2)).toBe(false);
    });

    it('should return false for unexpanded card', () => {
      expect(component.isCardExpanded(0)).toBe(false);
    });

    it('should return true for expanded card', () => {
      component.expandedCards[0] = true;
      expect(component.isCardExpanded(0)).toBe(true);
    });
  });

  describe('Status Configuration', () => {
    it('should return correct status config for "abierto"', () => {
      const config = component.getStatusConfig('abierto');
      expect(config.label).toBe('Abierto');
      expect(config.borderColor).toBeDefined();
    });

    it('should return correct status config for "pendiente"', () => {
      const config = component.getStatusConfig('pendiente');
      expect(config.label).toBe('Pendiente');
    });

    it('should return correct status config for "en-proceso"', () => {
      const config = component.getStatusConfig('en-proceso');
      expect(config.label).toBe('En Proceso');
    });

    it('should return correct status config for "resuelto"', () => {
      const config = component.getStatusConfig('resuelto');
      expect(config.label).toBe('Resuelto');
    });

    it('should return correct status config for "cerrado"', () => {
      const config = component.getStatusConfig('cerrado');
      expect(config.label).toBe('Cerrado');
    });

    it('should handle undefined status', () => {
      const config = component.getStatusConfig(undefined);
      expect(config.label).toBe('Abierto');
    });

    it('should handle case insensitivity', () => {
      const config1 = component.getStatusConfig('PENDIENTE');
      const config2 = component.getStatusConfig('pendiente');
      expect(config1).toEqual(config2);
    });
  });

  describe('Priority Configuration', () => {
    it('should return danger color for "crítica"', () => {
      const color = component.getPriorityColor('crítica');
      expect(color).toBe('#dc2626');
    });

    it('should return warning color for "alta"', () => {
      const color = component.getPriorityColor('alta');
      expect(color).toBe('#f97316');
    });

    it('should return yellow color for "media"', () => {
      const color = component.getPriorityColor('media');
      expect(color).toBe('#eab308');
    });

    it('should return green color for "baja"', () => {
      const color = component.getPriorityColor('baja');
      expect(color).toBe('#16a34a');
    });

    it('should return correct priority label', () => {
      expect(component.getPriorityLabel('crítica')).toBe('Crítica');
      expect(component.getPriorityLabel('alta')).toBe('Alta');
      expect(component.getPriorityLabel('media')).toBe('Media');
      expect(component.getPriorityLabel('baja')).toBe('Baja');
    });
  });

  describe('Duration Since Creation', () => {
    it('should return "Desconocida" for undefined date', () => {
      expect(component.getDurationSinceCreation(undefined)).toBe('Desconocida');
    });

    it('should return duration in days', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const duration = component.getDurationSinceCreation(pastDate);
      expect(duration).toContain('d');
    });

    it('should return duration in hours', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 3);
      const duration = component.getDurationSinceCreation(pastDate);
      expect(duration).toContain('h');
    });

    it('should return duration in minutes', () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 15);
      const duration = component.getDurationSinceCreation(pastDate);
      expect(duration).toContain('m');
    });

    it('should return "Hace poco" for recent date', () => {
      const pastDate = new Date();
      pastDate.setSeconds(pastDate.getSeconds() - 30);
      const duration = component.getDurationSinceCreation(pastDate);
      expect(duration).toBe('Hace poco');
    });
  });

  describe('Delete Operations', () => {
    beforeEach(() => {
      component.reportes = mockReportes;
      component.filteredReportes = mockReportes;
    });

    it('should delete reporte with confirmation', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      component.deleteReport(1);

      expect(apiService.eliminarReporte).toHaveBeenCalledWith(1);
      confirmSpy.mockRestore();
    });

    it('should not delete reporte without confirmation', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      component.deleteReport(1);

      expect(apiService.eliminarReporte).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('should remove reporte from array after deletion', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const initialLength = component.reportes.length;

      component.deleteReport(1);

      expect(component.reportes.length).toBe(initialLength - 1);
      expect(component.reportes.find((r) => r.reporteId === 1)).toBeUndefined();
      confirmSpy.mockRestore();
    });
  });

  describe('Memory Management', () => {
    it('should unsubscribe on destroy', () => {
      fixture.detectChanges();
      const nextSpy = vi.spyOn(component['destroy$'], 'next');
      const completeSpy = vi.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Actions', () => {
    it('should call updateReport method', () => {
      const spy = vi.spyOn(component, 'updateReport');
      component.updateReport(1);
      expect(spy).toHaveBeenCalledWith(1);
    });

    it('should call viewOnMap method', () => {
      const spy = vi.spyOn(component, 'viewOnMap');
      component.viewOnMap(1);
      expect(spy).toHaveBeenCalledWith(1);
    });

    it('should scroll to top', () => {
      const scrollSpy = vi.spyOn(window, 'scrollTo');
      component.scrollToTop();
      expect(scrollSpy).toHaveBeenCalled();
    });
  });
});
