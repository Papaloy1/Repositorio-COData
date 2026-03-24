import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerfilComponent } from './perfil.component';
import { ApiService } from '../../services/api.service';
import { of, throwError } from 'rxjs';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let apiService: Partial<ApiService>;

  const mockUsuario = {
    usuarioId: 1,
    nombre: 'John Doe',
    email: 'john@example.com',
    contraseña: 'hashedpassword',
    fechaRegistro: new Date('2024-01-15'),
    teléfono: '1234567890',
    rol: 'Usuario'
  };

  beforeEach(async () => {
    const apiServiceMock: Partial<ApiService> = {
      actualizarUsuario: vi.fn().mockReturnValue(of(undefined)),
      getUsuarioById: vi.fn().mockReturnValue(of(mockUsuario))
    };

    await TestBed.configureTestingModule({
      imports: [PerfilComponent, ReactiveFormsModule, CommonModule, HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: apiServiceMock }
      ]
    }).compileComponents();

    apiService = TestBed.inject(ApiService);
    localStorage.setItem('usuarioActual', JSON.stringify(mockUsuario));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load user profile from localStorage on init', () => {
      fixture.detectChanges();
      expect(component.usuario).toEqual(mockUsuario);
    });

    it('should populate form with user data', () => {
      fixture.detectChanges();
      expect(component.profileForm.get('nombre')?.value).toBe(mockUsuario.nombre);
      expect(component.profileForm.get('email')?.value).toBe(mockUsuario.email);
    });

    it('should handle missing localStorage data gracefully', () => {
      localStorage.clear();
      fixture.detectChanges();
      expect(component.usuario).toBeNull();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should require nombre field', () => {
      const nombreControl = component.profileForm.get('nombre');
      nombreControl?.setValue('');
      expect(nombreControl?.hasError('required')).toBeTruthy();
    });

    it('should validate nombre minimum length', () => {
      const nombreControl = component.profileForm.get('nombre');
      nombreControl?.setValue('Jo');
      expect(nombreControl?.hasError('minlength')).toBeTruthy();
    });

    it('should require email field', () => {
      const emailControl = component.profileForm.get('email');
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.profileForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();
    });

    it('should validate phone number format when provided', () => {
      const telControl = component.profileForm.get('teléfono');
      telControl?.setValue('123');
      expect(telControl?.hasError('pattern')).toBeTruthy();
    });

    it('should validate password minimum length', () => {
      const passControl = component.profileForm.get('contraseña');
      passControl?.setValue('12345');
      expect(passControl?.hasError('minlength')).toBeTruthy();
    });

    it('should validate passwords match', () => {
      const passControl = component.profileForm.get('contraseña');
      const confirmControl = component.profileForm.get('confirmarContraseña');
      
      passControl?.setValue('password123');
      confirmControl?.setValue('password456');
      
      expect(component.profileForm.hasError('passwordMismatch')).toBeTruthy();
    });

    it('should allow empty password (both fields)', () => {
      const passControl = component.profileForm.get('contraseña');
      const confirmControl = component.profileForm.get('confirmarContraseña');
      
      passControl?.setValue('');
      confirmControl?.setValue('');
      
      expect(component.profileForm.hasError('passwordMismatch')).toBeFalsy();
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should toggle edit mode', () => {
      expect(component.isEditing).toBeFalsy();
      component.toggleEditMode();
      expect(component.isEditing).toBeTruthy();
    });

    it('should reset form when exiting edit mode', () => {
      component.isEditing = true;
      component.profileForm.get('nombre')?.setValue('New Name');
      
      component.toggleEditMode();
      
      expect(component.profileForm.get('nombre')?.value).toBe(mockUsuario.nombre);
    });

    it('should clear avatar preview on cancel', () => {
      component.isEditing = true;
      component.avatarPreview = 'data:image/png;base64,...';
      
      component.cancelEditing();
      
      expect(component.avatarPreview).toBeNull();
      expect(component.isEditing).toBeFalsy();
    });
  });

  describe('Avatar Upload', () => {
    let mockFile: File;

    beforeEach(() => {
      fixture.detectChanges();
      mockFile = new File(['fake image'], 'test.jpg', { type: 'image/jpeg' });
    });

    it('should accept valid image file', () => {
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: [mockFile],
        writable: false
      });
      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: input, enumerable: true });

      component.onAvatarSelected(event);

      expect(component.selectedFile).toBe(mockFile);
      expect(component.submitError).toBeNull();
    });

    it('should reject invalid file type', () => {
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: [invalidFile],
        writable: false
      });
      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: input, enumerable: true });

      component.onAvatarSelected(event);

      expect(component.selectedFile).toBeNull();
      expect(component.submitError).toContain('valid image file');
    });

    it('should reject file exceeding size limit', () => {
      const largeFile = new File(
        [new ArrayBuffer(6 * 1024 * 1024)],
        'large.jpg',
        { type: 'image/jpeg' }
      );
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false
      });
      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: input, enumerable: true });

      component.onAvatarSelected(event);

      expect(component.submitError).toContain('5MB');
    });

    it('should create image preview for valid file', fakeAsync(() => {
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: [mockFile],
        writable: false
      });
      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: input, enumerable: true });

      component.onAvatarSelected(event);
      tick();

      expect(component.avatarPreview).toBeTruthy();
    }));
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.isEditing = true;
    });

    it('should mark form as touched if invalid before submit', () => {
      component.profileForm.get('nombre')?.setValue('');
      component.submitForm();
      
      expect(component.profileForm.get('nombre')?.touched).toBeTruthy();
    });

    it('should call API service on valid form submission', () => {
      component.profileForm.get('nombre')?.setValue('Jane Doe');
      component.submitForm();

      expect(apiService.actualizarUsuario).toHaveBeenCalledWith(
        mockUsuario.usuarioId,
        expect.objectContaining({
          nombre: 'Jane Doe',
          email: mockUsuario.email
        })
      );
    });

    it('should show success message on successful update', fakeAsync(() => {
      component.submitForm();
      tick();

      expect(component.submitSuccess).toBeTruthy();
    }));

    it('should hide success message after timeout', fakeAsync(() => {
      component.submitForm();

      expect(component.submitSuccess).toBeTruthy();
      tick(3000);
      expect(component.submitSuccess).toBeFalsy();
    }));

    it('should display error message on API failure', fakeAsync(() => {
      const errorResponse = { error: { message: 'Update failed' } };
      (apiService.actualizarUsuario as any) = vi.fn().mockReturnValueOnce(
        throwError(() => errorResponse)
      );

      component.submitForm();
      tick();

      expect(component.submitError).toBeTruthy();
    }));

    it('should exit edit mode on successful submission', fakeAsync(() => {
      component.isEditing = true;

      component.submitForm();
      tick();

      expect(component.isEditing).toBeFalsy();
    }));

    it('should update localStorage on successful submission', fakeAsync(() => {
      component.profileForm.get('nombre')?.setValue('Updated Name');
      component.submitForm();
      tick();

      const stored = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
      expect(stored.nombre).toBe('Updated Name');
    }));
  });

  describe('Error Message Generation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should generate required field error', () => {
      const control = component.profileForm.get('nombre');
      control?.markAsTouched();
      control?.setValue('');
      
      const message = component.getErrorMessage('nombre');
      expect(message).toContain('required');
    });

    it('should generate minlength error', () => {
      const control = component.profileForm.get('nombre');
      control?.markAsTouched();
      control?.setValue('Jo');
      
      const message = component.getErrorMessage('nombre');
      expect(message).toContain('at least');
    });

    it('should generate email format error', () => {
      const control = component.profileForm.get('email');
      control?.markAsTouched();
      control?.setValue('invalid');
      
      const message = component.getErrorMessage('email');
      expect(message).toContain('valid email');
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should detect control has error', () => {
      const control = component.profileForm.get('nombre');
      control?.setValue('');
      control?.markAsTouched();
      
      expect(component.hasError('nombre')).toBeTruthy();
    });

    it('should return false if no error', () => {
      const control = component.profileForm.get('nombre');
      control?.setValue('Valid Name');
      
      expect(component.hasError('nombre')).toBeFalsy();
    });

    it('should return false if not touched yet', () => {
      const control = component.profileForm.get('nombre');
      control?.setValue('');
      
      expect(component.hasError('nombre')).toBeFalsy();
    });
  });

  describe('Memory Management', () => {
    it('should unsubscribe on destroy', () => {
      fixture.detectChanges();
      const destroySpy = vi.spyOn(component['destroy$'], 'next');
      const completeSpy = vi.spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
