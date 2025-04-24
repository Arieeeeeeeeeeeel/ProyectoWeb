# Proyecto ICI4247 - Plataforma de Repuestos y Servicios Automotrices

- Enlace al repositorio de GitHub: <https://github.com/Arieeeeeeeeeeeel/ProyectoWeb>
- Enlace al proyecto de Figma (Mockups): <https://figma.com/design/d0NmMMPpCM1lTrJ6LZxuRk/Mockups-Proyecto-ICI4247>

## Descripción del proyecto

Este proyecto consiste en una plataforma web y móvil desarrollada con **Ionic + Angular**, orientada a la venta de repuestos automotrices. Además de las funcionalidades básicas de e-commerce, incluye:

- Reserva de servicios mecánicos
- Panel administrativo para la gestión de productos y servicios

Los **requerimientos funcionales y no funcionales**, así como los distintos tipos de usuarios del sistema, están documentados en la carpeta `otros`, en el pdf con nombre `Especificación de requerimientos.pdf`.

Se incluyen bocetos tanto para la **versión web** como para la **versión móvil**. En esta primera entrega, se cumple con la estructura básica de navegación entre páginas.

## Funcionalidades

1. **Inicio de sesión:** Permite a los usuarios entrar en la aplicación e interactuar con el sistema de compra.
2. **Registro de usuario:** Permite que los usuarios guarden sus datos de forma permanente, tal como autos, historial de mantenciones, varios en general.
3. **Productos:** Se muestra a los usuarios y/o visitantes la disponibilidad de artículos como repuestos, lubricantes, herramientas, usados, entre otros.
4. **Servicios:** La plataforma da la posibilidad de agendar uno o más servicios como lo es la mantención automotriz, diagnóstico, servicio a domicilio o desabolladura y pintura.
5. **Quiénes somos:** Le entrega al usuario una perspectiva sobre cómo funciona la empresa, la historia y los empleados que la componen.

## Integrantes

- Carlos Abarza
- Martín Cevallos
- Ignacio Cuevas
- Vicente Morales
- Ariel Villar

## Prerrequisitos

### 1. Node.js

- Windows/macOS: descarga el instalador desde

    ```bash
    https://nodejs.org/
    ```

- Linux (Debian/Ubuntu):

    ```bash
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

- Verifica la instalación:

    ```bash
    node --version
    npm --version
    ```

### 2. Ionic CLI

Instálalo globalmente usando npm (funciona igual en todos los sistemas):

```bash
npm install -g @ionic/cli
```

Comprueba que esté instalado:

```bash
ionic --version
```

### 3. Git

Asegúrate de tener Git instalado para clonar el repositorio.

- Windows/macOS: descarga de <https://git-scm.com/>
- Linux (Debian/Ubuntu):

    ```bash
    sudo apt-get install git
    ```

## Clonación del repositorio

1. Abre tu terminal o PowerShell (Windows), Terminal.app (macOS) o tu shell preferido (Linux).
2. Ejecuta:

    ```bash
    git clone https://github.com/Arieeeeeeeeeeeel/ProyectoWeb.git
    ```

3. Entra en la carpeta del frontend:

    ```bash
    cd ProyectoWeb/frontend
    ```

## Instalación de dependencias

Dentro de la carpeta frontend, instala todas las dependencias con:

```bash
npm install
```

Nota: No subimos la carpeta node_modules al repositorio, por eso es necesario este paso.

## Ejecución en modo desarrollo

Para arrancar el servidor de desarrollo y abrir automáticamente tu navegador en la aplicación:

```bash
ionic serve
```

- Si no se abre el navegador, abre manualmente <http://localhost:8100/>.
