import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Usuario } from '../../models/usuario';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit, OnDestroy {
  registroForm!: FormGroup;
  isLoading = false;
  submitError: string | null = null;
  submitSuccess = false;
  currentStep: 'personal' | 'contact' | 'security' | 'confirm' = 'personal';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = 0;
  agreeToTerms = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.registroForm = this.fb.group({
      // Step 1: Personal Info
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      
      // Step 2: Contact Info
      email: ['', [Validators.required, Validators.email, this.uniqueEmailValidator.bind(this)]],
      teléfono: ['', [Validators.pattern(/^[\d\s\-\+\(\)]{10,}$/)]],
      
      // Step 3: Security
      contraseña: ['', [Validators.required, Validators.minLength(6), this.passwordStrengthValidator.bind(this)]],
      confirmarContraseña: ['', [Validators.required]],
      
      // Step 4: Acceptance
      agreeToTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator.bind(this) });

    // Watch password strength
    this.registroForm.get('contraseña')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(password => {
        this.calculatePasswordStrength(password);
      });
  }

  /**
   * Custom validator: Unique email
   * In a real app, this would check with the backend
   */
  uniqueEmailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    // TODO: Implement actual email uniqueness check via HTTP request
    // For now, just perform basic format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(control.value) ? null : { invalidEmail: true };
  }

  /**
   * Custom validator: Password strength
   * Requires at least one uppercase, one number
   */
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 6;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumber && isLongEnough;

    return passwordValid ? null : { weakPassword: true };
  }

  /**
   * Validator: Passwords must match
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('contraseña')?.value;
    const confirmPassword = control.get('confirmarContraseña')?.value;

    if (!password || !confirmPassword) return null;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Calculate password strength (0-100)
   */
  calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      return;
    }

    let strength = 0;
    const checks = {
      length: password.length >= 8 ? 20 : password.length >= 6 ? 10 : 0,
      lowercase: /[a-z]/.test(password) ? 20 : 0,
      uppercase: /[A-Z]/.test(password) ? 20 : 0,
      numbers: /\d/.test(password) ? 20 : 0,
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 20 : 0
    };

    strength = Object.values(checks).reduce((a, b) => a + b, 0);
    this.passwordStrength = Math.min(strength, 100);
  }

  /**
   * Get password strength label
   */
  getPasswordStrengthLabel(): string {
    if (this.passwordStrength < 25) return 'Muy débil';
    if (this.passwordStrength < 50) return 'Débil';
    if (this.passwordStrength < 75) return 'Moderado';
    return 'Fuerte';
  }

  /**
   * Get password strength color
   */
  getPasswordStrengthColor(): string {
    if (this.passwordStrength < 25) return '#dc2626';
    if (this.passwordStrength < 50) return '#f97316';
    if (this.passwordStrength < 75) return '#eab308';
    return '#16a34a';
  }

  /**
   * Navigate between form steps
   */
  goToStep(step: 'personal' | 'contact' | 'security' | 'confirm'): void {
    if (!this.isStepValid(this.currentStep)) {
      this.markStepFieldsAsTouched(this.currentStep);
      return;
    }
    this.currentStep = step;
    this.submitError = null;
  }

  /**
   * Check if current step is valid
   */
  isStepValid(step: string): boolean {
    const fields: { [key: string]: string[] } = {
      personal: ['nombre', 'apellido'],
      contact: ['email', 'teléfono'],
      security: ['contraseña', 'confirmarContraseña'],
      confirm: ['agreeToTerms']
    };

    const stepFields = fields[step] || [];
    return stepFields.every(field => {
      const control = this.registroForm.get(field);
      return control && control.valid;
    });
  }

  /**
   * Mark all fields in a step as touched
   */
  markStepFieldsAsTouched(step: string): void {
    const fields: { [key: string]: string[] } = {
      personal: ['nombre', 'apellido'],
      contact: ['email', 'teléfono'],
      security: ['contraseña', 'confirmarContraseña'],
      confirm: ['agreeToTerms']
    };

    const stepFields = fields[step] || [];
    stepFields.forEach(field => {
      this.registroForm.get(field)?.markAsTouched();
    });
  }

  /**
   * Check if a field has error
   */
  hasError(fieldName: string): boolean {
    const field = this.registroForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.registroForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    if (errors['required']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} es requerido`;
    }
    if (errors['minlength']) {
      return `${fieldName} debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['email']) {
      return 'Por favor ingresa un email válido';
    }
    if (errors['pattern']) {
      return `${fieldName} tiene un formato inválido`;
    }
    if (errors['weakPassword']) {
      return 'La contraseña debe contener mayúsculas, minúsculas y números';
    }
    if (errors['invalidEmail']) {
      return 'Email no es válido';
    }

    return 'Campo inválido';
  }

  /**
   * Submit registration form
   */
  submitRegistro(): void {
    if (!this.registroForm.valid) {
      this.markStepFieldsAsTouched(this.currentStep);
      return;
    }

    if (!this.agreeToTerms) {
      this.submitError = 'Debes aceptar los términos y condiciones';
      return;
    }

    this.isLoading = true;
    this.submitError = null;

    const fullName = `${this.registroForm.get('nombre')?.value} ${this.registroForm.get('apellido')?.value}`;
    const newUser: Usuario = {
      usuarioId: 0,
      nombre: fullName,
      email: this.registroForm.get('email')?.value,
      contraseña: this.registroForm.get('contraseña')?.value,
      fechaRegistro: new Date(),
      teléfono: this.registroForm.get('teléfono')?.value || undefined
    };

    this.apiService.crearUsuario(newUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.submitSuccess = true;

          // Store user in localStorage
          localStorage.setItem('usuarioActual', JSON.stringify(response));

          // Redirect after a brief delay
          setTimeout(() => {
            this.router.navigate(['/mapa']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.submitError = error.error?.message || 'Error en el registro. Por favor intenta de nuevo.';
          console.error('Registration error:', error);
        }
      });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Get step progress percentage
   */
  getStepProgress(): number {
    const steps = { personal: 25, contact: 50, security: 75, confirm: 100 };
    return steps[this.currentStep];
  }

  /**
   * Check if step is completed
   */
  isStepCompleted(step: string): boolean {
    const completedSteps = {
      personal: this.isStepValid('personal'),
      contact: this.isStepValid('personal') && this.isStepValid('contact'),
      security: this.isStepValid('personal') && this.isStepValid('contact') && this.isStepValid('security'),
      confirm: this.isStepValid('personal') && this.isStepValid('contact') && this.isStepValid('security') && this.isStepValid('confirm')
    };
    return completedSteps[step as keyof typeof completedSteps] || false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
