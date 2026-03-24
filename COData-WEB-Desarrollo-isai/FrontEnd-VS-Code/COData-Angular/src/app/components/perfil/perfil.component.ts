import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Usuario } from '../../models/usuario';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  usuario: Usuario | null = null;
  isLoading = false;
  isEditing = false;
  submitSuccess = false;
  submitError: string | null = null;
  avatarPreview: string | null = null;
  selectedFile: File | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Create the reactive form with validation rules
   */
  private createForm(): FormGroup {
    return this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.minLength(6), Validators.maxLength(50)]],
      confirmarContraseña: [''],
      teléfono: ['', [Validators.pattern(/^[0-9]{7,15}$/)]],
      rol: [{ value: '', disabled: true }],
      fechaRegistro: [{ value: '', disabled: true }]
    }, { 
      validators: this.passwordMatchValidator() 
    });
  }

  /**
   * Load user profile from localStorage or API
   */
  private loadUserProfile(): void {
    this.isLoading = true;
    
    // Try to get from localStorage first
    const usuarioActual = localStorage.getItem('usuarioActual');
    
    if (usuarioActual) {
      try {
        this.usuario = JSON.parse(usuarioActual);
        this.populateForm();
      } catch (error) {
        console.error('Error parsing usuario from localStorage:', error);
      }
    }
    
    this.isLoading = false;
  }

  /**
   * Populate form with current user data
   */
  private populateForm(): void {
    if (this.usuario) {
      this.profileForm.patchValue({
        nombre: this.usuario.nombre,
        email: this.usuario.email,
        rol: 'Usuario', // Default role, adjust based on your actual roles
        fechaRegistro: new Date(this.usuario.fechaRegistro).toLocaleDateString('es-ES')
      });
    }
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator() {
    return (form: FormGroup) => {
      const contraseña = form.get('contraseña');
      const confirmar = form.get('confirmarContraseña');
      
      if (contraseña && confirmar) {
        if (contraseña.value && contraseña.value !== confirmar.value) {
          confirmar.setErrors({ passwordMismatch: true });
          return { passwordMismatch: true };
        }
      }
      return null;
    };
  }

  /**
   * Handle avatar image selection
   */
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!validTypes.includes(file.type)) {
        this.submitError = 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.submitError = 'Image size must be less than 5MB';
        return;
      }
      
      this.selectedFile = file;
      this.submitError = null;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.profileForm.reset();
      this.populateForm();
      this.selectedFile = null;
      this.avatarPreview = null;
    }
  }

  /**
   * Cancel editing
   */
  cancelEditing(): void {
    this.isEditing = false;
    this.profileForm.reset();
    this.populateForm();
    this.selectedFile = null;
    this.avatarPreview = null;
    this.submitError = null;
  }

  /**
   * Submit the profile form
   */
  submitForm(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isLoading = true;
    this.submitError = null;
    this.submitSuccess = false;

    const formData = this.profileForm.getRawValue();
    
    if (this.usuario) {
      const updatedUsuario: Usuario = {
        ...this.usuario,
        nombre: formData.nombre,
        email: formData.email,
        ...(formData.contraseña && { contraseña: formData.contraseña })
      };

      // Update user in API
      this.apiService.actualizarUsuario(this.usuario.usuarioId, updatedUsuario)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.usuario = updatedUsuario;
            localStorage.setItem('usuarioActual', JSON.stringify(updatedUsuario));
            this.submitSuccess = true;
            this.isEditing = false;
            this.isLoading = false;
            
            // Hide success message after 3 seconds
            setTimeout(() => {
              this.submitSuccess = false;
            }, 3000);
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.submitError = error.error?.message || 'Error updating profile. Please try again.';
            this.isLoading = false;
          }
        });
    }
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Get error message for a form field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) return `${fieldName} is required`;
    if (control.errors['minlength']) return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['maxlength']) return `${fieldName} must be at most ${control.errors['maxlength'].requiredLength} characters`;
    if (control.errors['email']) return 'Enter a valid email address';
    if (control.errors['pattern']) return `${fieldName} format is invalid`;
    if (control.errors['passwordMismatch']) return 'Passwords do not match';
    
    return 'Invalid input';
  }

  /**
   * Check if a field has an error and is touched
   */
  hasError(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
