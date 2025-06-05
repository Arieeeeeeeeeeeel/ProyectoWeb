import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Define una interfaz más completa para el usuario almacenado
export interface UserProfile { // Exportamos la interfaz para usarla en otros componentes
  usuario: string;
  rut: string;
  email: string; // Cambiado de 'correo' a 'email' para consistencia en el login
  region: string;
  comuna: string;
  contrasena: string; // Para pruebas; en real, nunca guardar aquí
  // Añade otros campos si los tienes en tu formulario de registro
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this._isLoggedIn.asObservable();

  // Para almacenar el usuario logueado actualmente
  private _currentUser = new BehaviorSubject<UserProfile | null>(null);
  currentUser$: Observable<UserProfile | null> = this._currentUser.asObservable();

  private registeredUsers: UserProfile[] = [];
  private readonly USERS_KEY = 'registeredUsers';
  private readonly LOGGED_IN_USER_KEY = 'loggedInUserEmail'; // Para recordar qué usuario está logueado

  constructor() {
    this.loadUsersFromLocalStorage(); // Carga todos los usuarios registrados
    this.loadCurrentUserSession(); // Intenta cargar la sesión del usuario actual
  }

  private loadUsersFromLocalStorage() {
    try {
      const usersJson = localStorage.getItem(this.USERS_KEY);
      if (usersJson) {
        const parsedUsers = JSON.parse(usersJson);
        if (Array.isArray(parsedUsers) && parsedUsers.every(u => typeof u === 'object' && u !== null && 'email' in u && typeof u.email === 'string')) {
          this.registeredUsers = parsedUsers;
          console.log('AuthService [LOAD SUCCESS]: Usuarios registrados cargados:', this.registeredUsers);
        } else {
          console.warn('AuthService [LOAD WARN]: Datos de usuarios en localStorage corruptos. Reseteando.');
          this.registeredUsers = [];
          this.saveUsersToLocalStorage();
        }
      } else {
        console.log('AuthService [LOAD]: No hay usuarios registrados en localStorage.');
        this.registeredUsers = [];
      }
    } catch (e) {
      console.error('AuthService [LOAD ERROR]: Error al parsear JSON de localStorage. Reseteando usuarios.', e);
      this.registeredUsers = [];
      this.saveUsersToLocalStorage();
    }
  }

  private saveUsersToLocalStorage() {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(this.registeredUsers));
    console.log('AuthService [SAVE]: Usuarios registrados guardados:', this.registeredUsers);
  }

  private loadCurrentUserSession() {
    const loggedInUserEmail = localStorage.getItem(this.LOGGED_IN_USER_KEY);
    if (loggedInUserEmail) {
      const foundUser = this.registeredUsers.find(u => u.email.trim().toLowerCase() === loggedInUserEmail.trim().toLowerCase());
      if (foundUser) {
        this._isLoggedIn.next(true);
        this._currentUser.next(foundUser);
        console.log('AuthService [SESSION]: Sesión de usuario restaurada para:', foundUser.email);
      } else {
        console.log('AuthService [SESSION]: Usuario de sesión recordado no encontrado en la lista de registrados.');
        this.logout(); // Limpiar sesión si el usuario no existe
      }
    } else {
      console.log('AuthService [SESSION]: No hay sesión de usuario recordada.');
      this._isLoggedIn.next(false);
      this._currentUser.next(null);
    }
  }

  registerUser(userData: any): boolean {
    console.log('AuthService [REGISTER]: Datos recibidos para registro:', userData);

    if (!userData || typeof userData.correo !== 'string' || typeof userData.contrasena !== 'string') {
      console.error('AuthService [REGISTER ERROR]: Datos de usuario incompletos o inválidos.', userData);
      return false;
    }

    // Aquí creamos el objeto UserProfile completo con todos los datos
    const newUser: UserProfile = {
      usuario: userData.usuario.trim(),
      rut: userData.rut.trim(),
      email: userData.correo.trim(), // Asegura que el email se guarde limpio
      region: userData.region.trim(),
      comuna: userData.comuna.trim(),
      contrasena: userData.contrasena.trim(), // Asegura que la contraseña se guarde limpia
      // Asegúrate de incluir todos los campos del formulario de registro
    };

    const normalizedNewEmail = newUser.email.toLowerCase();

    const existingUser = this.registeredUsers.find(u => {
      if (u && typeof u.email === 'string' && u.email !== null) {
        return u.email.trim().toLowerCase() === normalizedNewEmail;
      }
      return false;
    });

    if (existingUser) {
      console.warn('AuthService [REGISTER]: Intento de registrar un email ya existente:', normalizedNewEmail);
      return false;
    }

    this.registeredUsers.push(newUser);
    this.saveUsersToLocalStorage();
    console.log('AuthService [REGISTER]: Nuevo usuario añadido y guardado:', newUser);
    return true;
  }

  login(email: string, contrasena: string): boolean {
    console.log('AuthService [LOGIN]: Intento de login para email:', email, '| contraseña:', contrasena);
    console.log('AuthService [LOGIN]: Usuarios registrados para buscar:', this.registeredUsers);

    if (typeof email !== 'string' || typeof contrasena !== 'string') {
      console.error('AuthService [LOGIN ERROR]: Inputs de login inválidos (no son strings).');
      return false;
    }

    const inputEmail = email.trim().toLowerCase();
    const inputContrasena = contrasena.trim();

    const foundUser = this.registeredUsers.find(
      (user) => {
        if (!user || typeof user.email !== 'string' || user.email === null || typeof user.contrasena !== 'string' || user.contrasena === null) {
          console.warn('AuthService [LOGIN DEBUG]: Elemento inválido en registeredUsers durante la búsqueda:', user);
          return false;
        }

        const storedEmail = user.email.trim().toLowerCase();
        const storedContrasena = user.contrasena.trim();

        const emailMatch = storedEmail === inputEmail;
        const passwordMatch = storedContrasena === inputContrasena;

        console.log(`AuthService [LOGIN - COMPARE]:
          Input Email: '${inputEmail}' vs Stored Email: '${storedEmail}' (Match: ${emailMatch})
          Input Contraseña: '${inputContrasena}' vs Stored Contraseña: '${storedContrasena}' (Match: ${passwordMatch})
        `);
        return emailMatch && passwordMatch;
      }
    );

    if (foundUser) {
      this._isLoggedIn.next(true);
      this._currentUser.next(foundUser); // Establece el usuario actual
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem(this.LOGGED_IN_USER_KEY, foundUser.email); // Guarda el email del usuario logueado
      console.log('AuthService [LOGIN]: Login exitoso para:', inputEmail);
      return true;
    } else {
      console.error('AuthService [LOGIN]: Fallo de login: Usuario no encontrado o credenciales incorrectas.');
      return false;
    }
  }

  logout() {
    this._isLoggedIn.next(false);
    this._currentUser.next(null); // Borra el usuario actual
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem(this.LOGGED_IN_USER_KEY); // Borra el email del usuario logueado
    console.log('AuthService [LOGOUT]: Usuario ha cerrado sesión.');
  }

  // NUEVO: Método para actualizar el perfil del usuario
  updateUserProfile(updatedProfile: UserProfile): boolean {
    console.log('AuthService [UPDATE]: Intentando actualizar perfil:', updatedProfile);
    const normalizedUpdatedEmail = updatedProfile.email.trim().toLowerCase();

    const index = this.registeredUsers.findIndex(u => u.email.trim().toLowerCase() === normalizedUpdatedEmail);

    if (index !== -1) {
      // Actualizar el usuario en el array
      // OJO: Aquí se actualizan TODOS los campos, si hay campos sensibles
      // como la contraseña, deberías manejarlo aparte o de forma más segura.
      this.registeredUsers[index] = { ...updatedProfile }; // Usar spread para asegurar que sea un nuevo objeto

      this.saveUsersToLocalStorage(); // Guardar cambios
      this._currentUser.next(this.registeredUsers[index]); // Actualizar el usuario logueado
      console.log('AuthService [UPDATE]: Perfil actualizado y guardado para:', normalizedUpdatedEmail);
      return true;
    } else {
      console.error('AuthService [UPDATE ERROR]: Usuario no encontrado para actualización:', normalizedUpdatedEmail);
      return false;
    }
  }
}