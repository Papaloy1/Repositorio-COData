import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(FormsModule, ReactiveFormsModule) ]
};
