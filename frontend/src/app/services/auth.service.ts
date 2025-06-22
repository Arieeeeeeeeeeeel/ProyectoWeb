// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NavController } from '@ionic/angular';

export interface UserProfile {
  personaid: number;
  usuario: string;
  rut: string;
  correo: string;
  region: string;
  comuna: string;
  telefono?: string; // <--- NUEVO CAMPO
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = 'http://localhost:5000/auth'; // URL base para autenticación
  private USER_URL = 'http://localhost:5000/profile'; // URL base para perfiles de usuario
  private RECOVERY_URL = 'http://localhost:5000/recovery'; // URL base para recuperación de contraseña

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$: Observable<UserProfile | null> = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private navCtrl: NavController
  ) {
    // Intenta cargar el usuario desde localStorage al iniciar el servicio
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUserSubject.next(JSON.parse(saved));
    }
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * @param data Los datos del usuario para el registro.
   * @returns Un Observable que emite el perfil del usuario registrado.
   */
  registerUser(data: {
    usuario: string;
    rut: string;
    correo: string;
    region: string;
    comuna: string;
    contrasena: string;
  }): Observable<UserProfile> {
    return this.http.post<{ token: string; user: UserProfile }>(
      `${this.API_URL}/signup`, data
    ).pipe(
      tap(res => {
        // Guarda el usuario actual en el BehaviorSubject y en localStorage
        localStorage.setItem('authToken', res.token);
        this.currentUserSubject.next(res.user);
        localStorage.setItem('currentUser', JSON.stringify(res.user));
      }),
      map(res => res.user)
    );
  }

  /**
   * Realiza el inicio de sesión del usuario.
   * @param correo El correo electrónico del usuario.
   * @param contrasena La contraseña del usuario.
   * @returns Un Observable que emite el perfil del usuario si el login es exitoso.
   */
  login(correo: string, contrasena: string): Observable<UserProfile> {
    return this.http.post<{ token: string; user: UserProfile }>(
      `${this.API_URL}/login`, { correo, contrasena }
    ).pipe(
      tap(res => {
        // Almacena el token y el perfil del usuario en localStorage
        localStorage.setItem('authToken', res.token);
        this.currentUserSubject.next(res.user);
        localStorage.setItem('currentUser', JSON.stringify(res.user));
      }),
      // Mapea el Observable para que devuelva directamente el UserProfile
      map(res => res.user)
    );
  }

  /**
   * **NUEVO MÉTODO**
   * Envía una solicitud al backend para iniciar el proceso de restablecimiento de contraseña.
   * Se espera que el backend envíe un correo electrónico con un enlace de restablecimiento.
   * @param correo El correo electrónico del usuario que olvidó su contraseña.
   * @returns Un Observable que se completa si la solicitud es exitosa.
   */
  requestPasswordReset(correo: string): Observable<any> {
    return this.http.post<any>(`${this.RECOVERY_URL}/recovery`, { correo });
  }

  confirmPasswordReset(
    personaid: number,
    token: string,
    nuevaContrasena: string
  ): Observable<any> {
    const url = `${this.RECOVERY_URL}/${personaid}/recovery`;
    return this.http.put<any>(url, { token, nueva_contrasena: nuevaContrasena });
  }

  /**
   * Cierra la sesión del usuario.
   * Elimina el token de autenticación y el perfil del usuario de localStorage.
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    // Navega a la página de inicio después de cerrar sesión
    this.navCtrl.navigateRoot('/home');
  }

  /**
   * Obtiene el perfil del usuario actualmente autenticado.
   * @returns El objeto UserProfile del usuario actual o null si no hay sesión activa.
   */
  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  /**
   * Actualiza el perfil de un usuario existente.
   * Se requiere un token de autenticación para esta operación.
   * @param personaid El ID de la persona a actualizar.
   * @param changes Un objeto con los campos del perfil a modificar.
   * @returns Un Observable que emite el perfil de usuario actualizado.
   */
  updateUserProfile(personaid: number,
    changes: { usuario: string; correo: string; region: string; comuna: string; telefono?: string; }): Observable<UserProfile> {
    const token = localStorage.getItem('authToken') || '';
    return this.http
      .put<UserProfile>(
        `${this.USER_URL}/${personaid}/update_profile`,
        changes,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .pipe(
        tap(user => {
          // Actualizamos el BehaviorSubject y el storage con el perfil actualizado
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }),
        map(user => user) // Mapea el Observable para devolver el UserProfile directamente
      );
  }
}
