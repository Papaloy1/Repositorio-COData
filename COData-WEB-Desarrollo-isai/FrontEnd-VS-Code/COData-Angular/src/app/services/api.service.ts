import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Reportes, 
  Usuario, 
  Categorias, 
  Notificaciones, 
  Evidencias, 
  HistorialReportes, 
  Ubicaciones 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:7099/api';

  constructor(private http: HttpClient) { }

  // ============ CATEGORIAS ============
  getCategorias(): Observable<Categorias[]> {
    return this.http.get<Categorias[]>(`${this.apiUrl}/Categorias`);
  }

  crearCategoria(categoria: Categorias): Observable<Categorias> {
    return this.http.post<Categorias>(`${this.apiUrl}/Categorias`, categoria);
  }

  getCategoriaById(id: number): Observable<Categorias> {
    return this.http.get<Categorias>(`${this.apiUrl}/Categorias/${id}`);
  }

  actualizarCategoria(id: number, categoria: Categorias): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Categorias/${id}`, categoria);
  }

  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Categorias/${id}`);
  }

  // ============ EVIDENCIAS ============
  getEvidencias(): Observable<Evidencias[]> {
    return this.http.get<Evidencias[]>(`${this.apiUrl}/Evidencias`);
  }

  crearEvidencia(evidencia: FormData): Observable<Evidencias> {
    return this.http.post<Evidencias>(`${this.apiUrl}/Evidencias`, evidencia);
  }

  getEvidenciaById(id: number): Observable<Evidencias> {
    return this.http.get<Evidencias>(`${this.apiUrl}/Evidencias/${id}`);
  }

  actualizarEvidencia(id: number, evidencia: Evidencias): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Evidencias/${id}`, evidencia);
  }

  eliminarEvidencia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Evidencias/${id}`);
  }

  // ============ HISTORIAL REPORTES ============
  getHistorialReportes(): Observable<HistorialReportes[]> {
    return this.http.get<HistorialReportes[]>(`${this.apiUrl}/HistorialReportes`);
  }

  crearHistorialReporte(historial: HistorialReportes): Observable<HistorialReportes> {
    return this.http.post<HistorialReportes>(`${this.apiUrl}/HistorialReportes`, historial);
  }

  getHistorialReporteById(id: number): Observable<HistorialReportes> {
    return this.http.get<HistorialReportes>(`${this.apiUrl}/HistorialReportes/${id}`);
  }

  actualizarHistorialReporte(id: number, historial: HistorialReportes): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/HistorialReportes/${id}`, historial);
  }

  eliminarHistorialReporte(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/HistorialReportes/${id}`);
  }

  // ============ NOTIFICACIONES ============
  getNotificaciones(): Observable<Notificaciones[]> {
    return this.http.get<Notificaciones[]>(`${this.apiUrl}/Notificaciones`);
  }

  crearNotificacion(notificacion: Notificaciones): Observable<Notificaciones> {
    return this.http.post<Notificaciones>(`${this.apiUrl}/Notificaciones`, notificacion);
  }

  getNotificacionById(id: number): Observable<Notificaciones> {
    return this.http.get<Notificaciones>(`${this.apiUrl}/Notificaciones/${id}`);
  }

  actualizarNotificacion(id: number, notificacion: Notificaciones): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Notificaciones/${id}`, notificacion);
  }

  eliminarNotificacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Notificaciones/${id}`);
  }

  // ============ REPORTES ============
  getReportes(): Observable<Reportes[]> {
    return this.http.get<Reportes[]>(`${this.apiUrl}/Reportes`);
  }

  crearReporte(reporte: Reportes): Observable<Reportes> {
    return this.http.post<Reportes>(`${this.apiUrl}/Reportes`, reporte);
  }

  getReporteById(id: number): Observable<Reportes> {
    return this.http.get<Reportes>(`${this.apiUrl}/Reportes/${id}`);
  }

  actualizarReporte(id: number, reporte: Reportes): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Reportes/${id}`, reporte);
  }

  eliminarReporte(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Reportes/${id}`);
  }

  // ============ UBICACIONES ============
  getUbicaciones(): Observable<Ubicaciones[]> {
    return this.http.get<Ubicaciones[]>(`${this.apiUrl}/Ubicaciones`);
  }

  crearUbicacion(ubicacion: Ubicaciones): Observable<Ubicaciones> {
    return this.http.post<Ubicaciones>(`${this.apiUrl}/Ubicaciones`, ubicacion);
  }

  getUbicacionById(id: number): Observable<Ubicaciones> {
    return this.http.get<Ubicaciones>(`${this.apiUrl}/Ubicaciones/${id}`);
  }

  actualizarUbicacion(id: number, ubicacion: Ubicaciones): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Ubicaciones/${id}`, ubicacion);
  }

  eliminarUbicacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Ubicaciones/${id}`);
  }

  buscarUbicacionPorDireccion(direccion: string): Observable<Ubicaciones[]> {
    return this.http.get<Ubicaciones[]>(`${this.apiUrl}/Ubicaciones/buscar-direccion?direccion=${direccion}`);
  }

  // ============ USUARIO ============
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/Usuario`);
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/Usuario`, usuario);
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/Usuario/${id}`);
  }

  actualizarUsuario(id: number, usuario: Usuario): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Usuario/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Usuario/${id}`);
  }
}