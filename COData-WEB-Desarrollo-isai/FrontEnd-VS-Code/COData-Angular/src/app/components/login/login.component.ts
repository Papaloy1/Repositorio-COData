import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Usuario } from '../../models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isSignUp = false;
  isLoadingLogin = false;
  isLoadingRegister = false;
  loginError: string | null = null;
  registerError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    // Login Form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Register Form
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  toggleForm(isSignUp: boolean): void {
    this.isSignUp = isSignUp;
    this.loginError = null;
    this.registerError = null;
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoadingLogin = true;
    this.loginError = null;

    const loginData = {
      email: this.loginForm.get('email')?.value,
      contraseña: this.loginForm.get('contraseña')?.value,
    };

    // TODO: Call actual login endpoint
    // this.apiService.login(loginData).subscribe({
    //   next: (response) => {
    //     localStorage.setItem('authToken', response.token);
    //     localStorage.setItem('usuarioActual', JSON.stringify(response.usuario));
    //     this.router.navigate(['/mapa']);
    //   },
    //   error: (error) => {
    //     this.isLoadingLogin = false;
    //     this.loginError = error.error?.message || 'Email o contraseña incorrectos.';
    //   },
    // });

    // Temporary: Simulate login delay
    setTimeout(() => {
      this.isLoadingLogin = false;
      this.loginError = 'Endpoint de login aún no implementado en backend.';
    }, 1500);
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoadingRegister = true;
    this.registerError = null;

    const newUser: Usuario = {
      usuarioId: 0,
      nombre: `${this.registerForm.get('nombre')?.value} ${this.registerForm.get('apellido')?.value}`,
      email: this.registerForm.get('email')?.value,
      contraseña: this.registerForm.get('contraseña')?.value,
      fechaRegistro: new Date(),
    };

    this.apiService.crearUsuario(newUser).subscribe({
      next: (response) => {
        this.isLoadingRegister = false;

        // Store user in localStorage
        localStorage.setItem('usuarioActual', JSON.stringify(response));

        // Clear form and redirect to mapa
        this.registerForm.reset();
        this.router.navigate(['/mapa']);
      },
      error: (error) => {
        this.isLoadingRegister = false;
        this.registerError =
          error.error?.message || 'Error en el registro. Intenta de nuevo.';
        console.error('Register error:', error);
      },
    });
  }
}
