# Guía para mantener la web

Esta web es estática: solo HTML, CSS, JS e imágenes. No hay servidor ni base de datos.
Para actualizar contenido se editan archivos y se suben al hosting (por FTP, GitHub, Netlify, etc.).

---

## ⚠️ LÉEME PRIMERO — cosas importantes

### Al recibir la web — activar el formulario
La **primera vez** que alguien envíe el formulario te llegará un email de **Formsubmit**
con el asunto *"Confirm your email"*. Abre ese email y clica el botón **"Activate Form"**.
Si no lo haces, el formulario NO envía nada.
Solo hay que hacerlo UNA vez. Después todo funciona automático.

### Formsubmit — cupos y límite de adjuntos
- **Envíos**: ilimitados en el plan gratuito. No hay cupo diario.
- **Adjuntos**: máximo **10 MB en total por envío** (sumando todas las imágenes).
  La web ya lo limita a **9 MB** para dejar margen; si alguien intenta adjuntar
  más, le aparece un aviso y no se envía hasta que quite fotos.
- Si una persona manda 15 fotos de 2 MB cada una, no llegarán todas. Tiene que
  bajar el peso o mandar menos.

### Qué tocar y qué NO tocar
- ✅ **Sí puedes tocar:** `data.json` (textos), los archivos en `data/` (imágenes), el email en `booking.html`
- ❌ **Mejor no toques:** archivos `.html`, `.css`, `.js` (si no sabes qué estás haciendo, se puede romper algo)
- Si tocas algo por error, **no guardes**, cierra sin guardar y vuelve a abrir

### Añadir imágenes — es automático
Para añadir/quitar imágenes **solo hay que tocar la carpeta** (`data/images/flashbook/` o
`data/images/tattoo/`). La web detecta sola cuántas hay. Ver sección 2 para los detalles.

### Formato de imágenes
- **Siempre WebP** — es el formato que usa la web. Si tienes JPG o PNG, conviértelos primero.
- Conversores gratuitos online: [squoosh.app](https://squoosh.app), [cloudconvert.com](https://cloudconvert.com)
- **Tamaño recomendado:** entre 1000–2000px de ancho. Más grande = web más lenta.
- **Peso recomendado:** menos de 300 KB por imagen

### Caché del navegador
Si cambias una imagen y al abrir la web sigues viendo la vieja: es la caché del navegador.
Solución: refrescar con **Ctrl+F5** (Windows) o **Cmd+Shift+R** (Mac).

### Antes de subir cambios
Abre los archivos en tu ordenador y comprueba que la web se ve bien en local antes de
subirla al hosting. Cualquier error tipográfico en `data.json` rompe las galerías.

---

## 1. Cambiar el email que recibe el formulario

Abrir `booking.html` y buscar esta línea (cerca del principio del `<form>`):

```html
<form class="booking-form" action="https://formsubmit.co/tu@email.com" ...
```

Cambiar el email por el que quieras recibir los avisos.

**IMPORTANTE — solo la primera vez:**
Cuando alguien envíe el formulario por primera vez con el nuevo email, Formsubmit
manda un email de activación a esa dirección. Hay que abrirlo y clicar **"Activate Form"**.
Solo una vez. Después llegan todos los envíos directamente.

Más detalle técnico en [`docs/SETUP_FORMSUBMIT.txt`](docs/SETUP_FORMSUBMIT.txt).

---

## 2. Cambiar / añadir imágenes de las galerías

Las galerías son **flashbook** y **tattoo**. Cada una tiene su carpeta:

- `data/images/flashbook/` — imágenes del flashbook
- `data/images/tattoo/` — tatuajes realizados

### Reglas

1. **Formato:** todas las imágenes deben ser `.webp` (convierte con cualquier herramienta online o Photoshop)
2. **Nombre:** numeradas desde 1 sin saltos: `1.webp`, `2.webp`, `3.webp`, ...

La web cuenta sola cuántas hay — **no hay que actualizar ningún contador**.

### Cómo añadir imágenes nuevas

Si tienes 129 y quieres añadir 3 más: guárdalas como `130.webp`, `131.webp`, `132.webp`
en la carpeta. Ya está.

### Cómo borrar o reemplazar

Si borras una imagen del medio (por ejemplo `50.webp`), **hay que renumerar** las que van después
para que no queden huecos (la web se para al encontrar un hueco). O bien, reemplaza el archivo
directamente manteniendo el nombre.

---

## 3. Cambiar los textos del formulario

El formulario está en **inglés** por defecto. Los textos que ve el usuario al enviar
(y el asunto del email que te llega) se editan desde `data.json`, bloque `"booking"`:

```json
"booking": {
  "title": "How to Book",
  "background": "data/backgrounds/howToBook.webp",
  "emailSubject": "New booking — ViciosTorpes",
  "confirmation": {
    "title": "Message sent",
    "message": "I'll contact you soon"
  },
  "errorMessage": "Failed to send. Please try again."
}
```

- `emailSubject` — asunto del email que te llega cuando alguien rellena el formulario
- `confirmation.title` y `confirmation.message` — mensaje que ve el usuario tras enviar el formulario
- `errorMessage` — texto de error si falla el envío

> Las **etiquetas** del formulario (Name, Email, Instagram, Location, Description,
> Reference images, Send) están en `booking.html`. Los **mensajes de validación**
> (email no válido, Instagram no válido, etc.) están en `js/booking.js`. Si los quieres
> cambiar, busca y sustituye el texto manteniendo las comillas.

---

## 4. Cambiar los fondos de sección

Los fondos están en `data/backgrounds/`:

- `welcome.webp` — fondo de la página de inicio
- `flashbook.webp` — fondo detrás del flashbook
- `tattoo.webp` — fondo detrás de los tatuajes
- `howToBook.webp` — fondo del formulario

Para cambiarlos: reemplaza el archivo manteniendo el mismo nombre.

---

## 5. Imagen central del landing (página de inicio)

En `data/welcome/`:

- `welcome.webp` — la imagen central del landing (texto "Welcome" con sus decorados).

Para cambiarla: reemplaza el archivo manteniendo el nombre. Recomendación: imagen
horizontal o cuadrada con transparencia; el alto se calcula solo (`height: auto`).

> En móvil la imagen se coloca a 3/4 de la altura (regulable desde `css/welcome.css`,
> bloque `@media (max-width: 768px) { .welcome-text { top: 75dvh; width: 95dvw; } }`).
>
> Había 7 imágenes decorativas adicionales (`0.webp` a `6.webp`) que fueron retiradas
> para simplificar el landing. El código que las generaba sigue en los `.js`/`.css`
> comentado por si se quisiera recuperar.

---

## 6. Cambiar el dominio (si migras de dominio)

Si en algún momento cambias `viciostorpes.com` por otro dominio, hay que actualizar las URLs en:

- `index.html` — canonical, Open Graph, Twitter Card, Schema.org (4-5 líneas al principio)
- `flashbook.html` — canonical, Open Graph, Twitter Card
- `tattoo.html` — canonical, Open Graph, Twitter Card
- `booking.html` — canonical, Open Graph, Twitter Card, campo `_next` del form
- `sitemap.xml` — las 4 URLs
- `robots.txt` — la URL del sitemap

Buscar y reemplazar `viciostorpes.com` por el nuevo dominio en todos los archivos.

---

## 7. SEO — qué hay configurado

Cada página tiene:
- `<title>`, meta description, keywords
- Canonical (URL oficial de la página)
- Open Graph (cómo se ve al compartir en WhatsApp, Facebook)
- Twitter Card (cómo se ve al compartir en Twitter/X)
- Schema.org (solo el index, marca la página como perfil de persona/artista)

Archivos SEO en la raíz:
- `robots.txt` — permite indexar todo
- `sitemap.xml` — lista las 4 páginas para Google

Para que Google indexe la web:
1. Ir a [Google Search Console](https://search.google.com/search-console)
2. Añadir la propiedad del dominio
3. Subir el sitemap: `https://tudominio.com/sitemap.xml`

---

## 8. Problemas frecuentes

### "Cambié una imagen y sigue apareciendo la antigua"
Es la caché del navegador. Refresca con **Ctrl+F5** (Windows) o **Cmd+Shift+R** (Mac).

### "Envié el formulario de prueba y no me ha llegado nada"
- ¿Activaste el email con Formsubmit la primera vez? (ver sección LÉEME arriba)
- Revisa la carpeta de **spam / promociones** — a veces caen ahí los primeros
- ¿Escribiste bien el email en `booking.html`? Un typo y no llega

### "Las galerías aparecen vacías o rotas"
Causas típicas:
- Error en `data.json` (coma de más o de menos) — abre `data.json` y comprueba que cuadra
- Falta una imagen numerada (ej. tienes 1, 2, 4 pero falta 3.webp) — la web se para al encontrar un hueco
- Ninguna imagen `1.webp` en la carpeta

### "Subo una imagen nueva y no aparece"
- ¿La convertiste a `.webp`?
- ¿La nombraste siguiendo el orden (la siguiente al último número, sin huecos)?
- ¿Refrescaste con Ctrl+F5?

### "Quiero contactar al desarrollador"
La web la hizo **manu (@meowrhino)**. Si algo se rompe y no sabes arreglarlo, contacta.

---

## Resumen rápido

| Tarea | Archivo a tocar |
|-------|-----------------|
| Cambiar email del formulario | `booking.html` |
| Cambiar textos del formulario (asunto, confirmación, error) | `data.json` |
| Añadir imagen flashbook | `data/images/flashbook/` (automático) |
| Añadir imagen tattoo | `data/images/tattoo/` (automático) |
| Cambiar fondo de sección | `data/backgrounds/` |
| Cambiar favicon | `data/favicon.png` |
| Cambiar dominio | todos los `.html` + `sitemap.xml` + `robots.txt` |

---

## Checklist de entrega (primer día)

- [ ] Abrir el email de Formsubmit y clicar "Activate Form"
- [ ] Hacer un envío de prueba del formulario y comprobar que llega
- [ ] Si usas un dominio propio, registrar la web en [Google Search Console](https://search.google.com/search-console) y subir el sitemap
- [ ] Compartir la web en WhatsApp/Instagram para comprobar que la previsualización sale bien (Open Graph)
