export interface Usuario {
  usuarioId: number;
  nombre: string;
  email: string;
  contraseña: string;
  fechaRegistro: Date;
  teléfono?: string;
  rol?: string;
  avatar?: string; // Base64 or URL to profile picture
}