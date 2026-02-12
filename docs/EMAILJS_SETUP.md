# Configurar EmailJS para el formulario de booking

El formulario de booking usa [EmailJS](https://www.emailjs.com) para enviar emails directamente desde el navegador, sin backend.

Plan gratis: **200 emails/mes**.

## Pasos

### 1. Crear cuenta

Ve a [emailjs.com](https://www.emailjs.com/), regístrate con email o Google.

### 2. Añadir Email Service

1. Dashboard > **Email Services** > **Add New Service**
2. Elige tu proveedor (Gmail, Outlook, etc.)
3. Conecta tu cuenta de correo (la que recibirá los emails de booking)
4. Apunta el **Service ID** (ej: `service_abc123`)

### 3. Crear Email Template

1. Dashboard > **Email Templates** > **Create New Template**
2. Configura el template así:

**Subject:**
```
Nueva reserva de {{from_name}}
```

**Content (HTML):**
```html
<h2>Nueva solicitud de booking</h2>

<p><strong>Nombre:</strong> {{from_name}}</p>
<p><strong>Email:</strong> {{from_email}}</p>
<p><strong>Teléfono:</strong> {{phone}}</p>
<p><strong>Localidad:</strong> {{location}}</p>

<h3>Descripción:</h3>
<p>{{description}}</p>
```

**To Email:** tu email (donde quieres recibir las solicitudes)
**Reply To:** `{{from_email}}` (para poder responder directamente al cliente)

3. Guarda y apunta el **Template ID** (ej: `template_xyz789`)

### 4. Obtener Public Key

1. Dashboard > **Account** > **General**
2. Copia tu **Public Key** (ej: `pk_ABCdef123`)

### 5. Configurar en el código

Abre `js/booking.js` y reemplaza los 3 valores al principio del archivo:

```js
const EMAILJS_PUBLIC_KEY = 'pk_ABCdef123';       // tu Public Key
const EMAILJS_SERVICE_ID = 'service_abc123';     // tu Service ID
const EMAILJS_TEMPLATE_ID = 'template_xyz789';   // tu Template ID
```

### 6. Probar

1. Abre `booking.html` en el navegador
2. Rellena el formulario y envía
3. Comprueba que llega el email

## Variables del template

Estas son las variables que el formulario envía a EmailJS (deben coincidir con el template):

| Variable | Campo del formulario |
|----------|---------------------|
| `{{from_name}}` | Nombre |
| `{{from_email}}` | Email |
| `{{phone}}` | Teléfono |
| `{{location}}` | Localidad |
| `{{description}}` | Descripción |

## Notas

- Mientras no estén configurados los IDs, el formulario simula el envío (funciona sin errores, pero no manda email)
- El plan gratis permite 200 emails/mes, 2 templates y 1 servicio
- Los emails se envían desde el navegador del cliente, no necesitas servidor
