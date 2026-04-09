# Dating XML Platform 2.0

Plataforma web avanzada para la creación, visualización, envío por Gmail y sincronización automática con Google Drive de perfiles XML.

## 🚀 Novedades de la Versión 2.0

- **Enriquecimiento Visual y Auditivo**: Nueva interfaz moderna con animaciones CSS, transiciones suaves, efectos de sonido y recursos visuales optimizados.
- **Seguridad Mejorada**: Implementación de cabeceras de seguridad y limpieza de rutinas legacy.
- **Permisos Automatizados**: Los permisos del navegador se gestionan de forma automática e inteligente, eliminando la necesidad de una sección manual de permisos.
- **Respaldo Inteligente en Drive**: Sistema de respaldo que organiza los perfiles en carpetas automáticas por fecha, eliminando estructuras antiguas para mantener el almacenamiento eficiente.
- **Perfiles de Muestra**: Incluye ejemplos XML listos para ser mostrados en la plataforma.

## 📁 Estructura del Repositorio

| Carpeta / Archivo | Descripción |
| :--- | :--- |
| `public/` | Frontend: HTML5, CSS3 moderno y JS con soporte de audio y animaciones. |
| `public/assets/` | Recursos multimedia (imágenes, sonidos, animaciones). |
| `src/services/` | Lógica de negocio: Gmail (Nodemailer), Drive (Google APIs) y perfiles. |
| `src/utils/` | Utilidades de cifrado y seguridad. |
| `data/` | Almacenamiento local de perfiles XML y ejemplos de muestra. |
| `server.js` | Servidor Express con rutas API optimizadas. |
| `.env.example` | Plantilla de configuración de variables de entorno. |

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/citasxdev/oficial.git
   cd oficial
   ```

2. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**:
   Copia `.env.example` a `.env` y completa los valores requeridos para Gmail y Google Drive.
   ```bash
   cp .env.example .env
   ```

4. **Configuración de Google Drive**:
   - Asegúrate de tener una **Cuenta de Servicio** de Google Cloud.
   - Proporciona el `GOOGLE_DRIVE_PARENT_ID` (ID de la carpeta raíz en Drive).
   - El sistema se encargará de crear subcarpetas automáticas de respaldo.

## 🖥️ Uso de la Plataforma

- **Inicio**: Accede a `http://localhost:5000` para ver la nueva interfaz.
- **Creación**: Completa el formulario para generar un nuevo perfil XML. Puedes elegir cifrar el contenido para mayor privacidad.
- **Gmail**: Introduce un correo en el formulario para enviar el XML generado directamente como adjunto.
- **Sincronización**: Si Drive está configurado, el archivo se subirá automáticamente a la carpeta de respaldo del día.

## 🔒 Seguridad y Permisos

- La plataforma utiliza políticas de seguridad modernas para proteger los datos de los usuarios.
- Los permisos de geolocalización y notificaciones se solicitan de forma automática según las mejores prácticas de UX, eliminando fricciones innecesarias.

---
*Plataforma desarrollada para la gestión eficiente y segura de datos XML en entornos de citas.*
