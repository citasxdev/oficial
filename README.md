# Dating XML Platform

**Dating XML Platform** es una aplicación web reorganizada para crear, visualizar y distribuir perfiles XML desde una interfaz más clara. El proyecto ahora separa el frontend, la lógica del servidor y los servicios de integración, y añade un flujo preparado para **enviar perfiles XML por Gmail** y **sincronizarlos con Google Drive**.

## Estructura del repositorio

| Ruta | Propósito |
| --- | --- |
| `public/` | Interfaz web estática, estilos y lógica del navegador. |
| `src/services/` | Servicios de perfiles XML, correo y Google Drive. |
| `src/utils/` | Utilidades compartidas, como cifrado. |
| `data/` | Archivos XML visibles en la plataforma y registros generados. |
| `.env.example` | Variables de entorno necesarias para Gmail, SMTP y Google Drive. |
| `server.js` | API Express y servidor principal. |

## Funcionalidades principales

| Funcionalidad | Descripción |
| --- | --- |
| Visualización de perfiles | Lee archivos XML desde `data/` y los muestra automáticamente en la interfaz. |
| Registro de perfiles | Genera un nuevo XML normalizado desde el formulario web. |
| Cifrado opcional | Permite guardar el XML cifrado en formato `.enc.xml`. |
| Envío por Gmail | Envía el XML generado como archivo adjunto a la dirección indicada. |
| Sincronización con Google Drive | Sube o actualiza automáticamente el XML en una carpeta remota configurada. |
| Estado de integraciones | La interfaz consulta si Gmail y Drive están disponibles. |

## Perfiles XML de muestra

Se añadieron varios archivos de ejemplo dentro de `data/` para que el catálogo se vea poblado desde el primer arranque. La API ya expone estos perfiles en `/api/perfiles`, y la interfaz los renderiza automáticamente.

## Instalación

```bash
pnpm install
pnpm start
```

Por defecto, la aplicación queda disponible en `http://localhost:5000`.

## Configuración de entorno

Copia `.env.example` a `.env` y completa las variables necesarias.

### Gmail

Para usar Gmail con Nodemailer, conviene configurar una **contraseña de aplicación** asociada a la cuenta que enviará los XML.

```env
GMAIL_USER=tu-cuenta@gmail.com
GMAIL_APP_PASSWORD=tu-app-password
MAIL_FROM=Dating XML Platform <tu-cuenta@gmail.com>
MAIL_DEFAULT_TO=
```

También se admite SMTP genérico si se prefiere otro proveedor.

### Google Drive

La sincronización con Drive está preparada para funcionar con una **cuenta de servicio** y una carpeta de destino compartida con dicha cuenta.

```env
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
```

## Flujo de uso

| Paso | Resultado |
| --- | --- |
| El usuario completa el formulario | Se normalizan los campos y se genera el XML. |
| Se guarda el archivo en `data/` | El perfil pasa a estar disponible para la plataforma. |
| Si hay destinatario y Gmail está configurado | El sistema envía el XML como adjunto. |
| Si Google Drive está configurado | El archivo se sincroniza con la carpeta remota. |
| La interfaz recarga el catálogo | El nuevo perfil aparece junto a los perfiles de muestra. |

## Endpoints principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Verifica que el servidor esté operativo. |
| `GET` | `/api/integraciones` | Informa el estado de Gmail y Google Drive. |
| `GET` | `/api/perfiles` | Devuelve los perfiles XML visibles. |
| `POST` | `/api/registro` | Crea un nuevo perfil XML y ejecuta envíos o sincronización si están disponibles. |

## Notas de despliegue

La integración quedó implementada a nivel de aplicación, pero para que el envío por Gmail y la sincronización con Google Drive funcionen en producción es necesario aportar credenciales reales mediante variables de entorno. Mientras no se configuren, el sistema seguirá creando y mostrando perfiles XML, y devolverá advertencias claras cuando no pueda completar el envío o la sincronización.
