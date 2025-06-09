# Proyecto ICI4247 - Plataforma de Repuestos y Servicios Automotrices

Este repositorio contiene el proyecto parcial para la asignatura de Ingeniería Web y Móvil (ICI 4247, ICI 4240). El proyecto está dividido en un *frontend* desarrollado con Ionic y un *backend* implementado con Flask, utilizando una base de datos MySQL. Esta entrega corresponde a la "Entrega Parcial 2: Integración frontend + backend y Autenticación".

-----

## Requisitos Previos

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas en tu sistema Linux:

  * **Node.js y npm**: Necesarios para el desarrollo frontend con Ionic.
  * **Ionic CLI**: La interfaz de línea de comandos de Ionic.
  * **Python 3 y pip**: Esenciales para el entorno del backend.
  * **Git**: Para clonar el repositorio.
  * **MySQL Server**: La base de datos relacional utilizada por el backend.

-----

## Guía de Instalación y Configuración

Sigue los siguientes pasos para configurar y ejecutar el proyecto en tu entorno local:

### 1\. Instalación de Dependencias del Sistema

Abre tu terminal y ejecuta los siguientes comandos para instalar las herramientas necesarias:

```bash
curl -fsSL [https://deb.nodesource.com/setup_18.x](https://deb.nodesource.com/setup_18.x) | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt install python3 python3-venv python3-pip
sudo apt-get install git
sudo apt install mysql-server
npm install -g @ionic/cli
```

### 2\. Clonar el Repositorio

Clona el repositorio en tu máquina local:

```bash
git clone [https://github.com/Arieeeeeeeeeeeel/ProyectoWeb.git](https://github.com/Arieeeeeeeeeeeel/ProyectoWeb.git)
```

### 3\. Configuración de la Base de Datos MySQL

Navega al directorio de la base de datos y carga el esquema inicial:

```bash
cd ProyectoWeb/backend/database
sudo mysql -u root -p < bd.sql
```

Si deseas tener algunos datos de prueba, reemplaza `bd.sql` con `bd_lyl_prueba.sql`:

```bash

**Importante**: Después de ejecutar el comando anterior, se te pedirá la contraseña del usuario `root` de MySQL.

Luego, necesitas actualizar la cadena de conexión de la base de datos en el archivo de configuración del backend. Abre el archivo `ProyectoWeb/backend/app/config/config.py` y modifica la línea de conexión para que coincida con tu usuario y contraseña de MySQL:

```python
# Ejemplo de la línea a modificar en config.py
# mysql+pymysql://root:tu_contraseña@localhost/BD_lyl
```

Reemplaza `tu_contraseña` con la contraseña de tu usuario de MySQL.

### 4\. Configuración y Ejecución del Frontend (Ionic)

El frontend está desarrollado con Ionic y Angular. Navega al directorio del frontend, instala las dependencias y levanta el servidor de desarrollo:

```bash
cd ProyectoWeb/frontend
npm install
ionic serve
```

Esto abrirá el frontend en tu navegador web, generalmente en `http://localhost:8100`.

### 5\. Configuración y Ejecución del Backend (Flask)

El backend está desarrollado con Flask (Python) y aplica APIs RESTful. En una **nueva terminal**, navega al directorio del backend, crea un entorno virtual, instala las dependencias y ejecuta la aplicación:

```bash
cd ProyectoWeb/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

El backend se ejecutará y estará disponible, por defecto, en `http://localhost:5000`.

-----
# Postman
Importar este archivo en Postman para ejecutar las peticiones de ejemplo a la API. [Postman](otros/LYL API Collection (Completa).postman_collection.json)

El archivo contiene ejemplos de peticiones a los endpoints de la API, incluyendo autenticación, gestión de usuarios, productos, entre otras cosas. En caso de ser necesario, puedes modificar las variables de entorno en Postman para adaptarlas a la configuración local.

## Información de la Entrega Parcial 2

Esta entrega parcial abarca los siguientes objetivos según el enunciado del proyecto:

  * **Creación del servidor en Flask**: El backend funcional con API REST.
  * **Configuración y modelado de la base de datos relacional**: Conexión a MySQL.
  * **Desarrollo de API REST con endpoints básicos**: Implementación de la API desde el backend.
  * **Consumo de la API desde Ionic usando HttpClient**: Integración entre el frontend y el backend.
  * **Implementación de autenticación con JWT (inicio de sesión/registro)**: Autenticación y manejo de usuarios.
  * **Validación de usuarios y manejo de sesiones**.

Para la verificación de la integración y la API, se recomienda usar herramientas como Postman o Insomnia.

-----
## Modelo de base de datos relacional

![alt text](backend/database/bd_lyl.png)

**Integrantes del Grupo:**

  * Carlos Abarza
  * Martín Cevallos
  * Ignacio Cuevas
  * Vicente Morales
  * Ariel Villar
