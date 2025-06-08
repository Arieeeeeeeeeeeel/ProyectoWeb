import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = 'http://localhost:5000/auth';
  private USER_URL = 'http://localhost:5000/profile';
  
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$: Observable<UserProfile | null> = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private navCtrl: NavController
  ) {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUserSubject.next(JSON.parse(saved));
    }
  }

  registerUser(data: {
    usuario: string;
    rut: string;
    correo: string;
    region: string;
    comuna: string;
    contrasena: string;
  }): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.API_URL}/signup`, data)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        })
      );
  }

  login(correo: string, contrasena: string): Observable<UserProfile> {
  return this.http.post<{ token: string; user: UserProfile }>(
    `${this.API_URL}/login`, { correo, contrasena }
  ).pipe(
    tap(res => {
      localStorage.setItem('authToken', res.token);
      this.currentUserSubject.next(res.user);
      localStorage.setItem('currentUser', JSON.stringify(res.user));
    }),
    // mapeamos el Observable para que devuelva directamente el UserProfile
    map(res => res.user)
  );
}

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.navCtrl.navigateRoot('/home');
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

 updateUserProfile(personaid: number,
   changes: { usuario: string; correo: string; region: string; comuna: string; }): Observable<UserProfile> {
    const token = localStorage.getItem('authToken') || '';
    console.log('Token para actualizar perfil:', token);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
   return this.http
     .put<UserProfile>(
       `${this.USER_URL}/${personaid}/update_profile`,
       changes,
       { headers }
     )
     .pipe(
       tap(user => {
         // Actualizamos el BehaviorSubject y el storage
         this.currentUserSubject.next(user);
         localStorage.setItem('currentUser', JSON.stringify(user));
       }),
       // Opcional: mapear si tu backend devuelve { user: {...} }
       map(user => user)
     );
  }
  
}
