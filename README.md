# ViciosTorpes V2

Portfolio interactivo para Marc, tatuador y diseñador. Web estática construida con HTML, CSS y JavaScript vanilla — sin frameworks, sin build, sin dependencias.

## Estructura

```
viciostorpesV2/
├── index.html          # Welcome — landing con imágenes decorativas y navegación
├── flashbook.html      # Galería flashbook (129 imágenes, modo mosaico + scroll)
├── tattoo.html         # Galería tattoo (72 imágenes, modo mosaico + scroll)
├── booking.html        # Formulario de contacto/reserva
├── data.json           # Configuración central (secciones, rutas, conteos)
├── css/
│   ├── main.css        # Reset global, variables CSS, utilidades
│   ├── welcome.css     # Posicionamiento y animaciones del landing
│   ├── navigation.css  # Sistema de navegación posicional unificado
│   ├── gallery.css     # Modos mosaico + scroll de las galerías
│   └── booking.css     # Estilos del formulario
├── js/
│   ├── welcome.js      # Generación dinámica de la página de inicio
│   ├── gallery.js      # Motor de galería dual (compartido flashbook/tattoo)
│   └── booking.js      # Envío AJAX del formulario (Formsubmit)
├── MANTENIMIENTO.md       # Guía de mantenimiento para el cliente
├── docs/
│   └── SETUP_FORMSUBMIT.txt # Detalle técnico: cómo cambiar el email del formulario
└── data/
    ├── backgrounds/    # Fondos de sección (.webp)
    ├── images/
    │   ├── flashbook/  # 0.webp — 128.webp (129 imágenes)
    │   └── tattoo/     # 0.webp — 71.webp (72 imágenes)
    ├── welcome/        # Imagen central del landing (welcome.webp)
    └── favicon.png     # Favicon
```

## Páginas

### Welcome (`index.html`)

Pantalla de bienvenida a pantalla completa con un logo central (`welcome.webp`) y tres botones de navegación a las secciones principales. El logo se centra en desktop/tablet y se desplaza a 3/4 de la altura (un poco más grande) en móvil (`<=768px`). Fade-in suave al cargar.

### Galerías (`flashbook.html`, `tattoo.html`)

Ambas páginas comparten el mismo `gallery.js` y se diferencian mediante el atributo `data-section` del body. Funcionan en dos modos:

**Modo mosaico** (por defecto):
- Imágenes colocadas aleatoriamente en un canvas de 2400px con detección de colisiones
- Tamaños aleatorios (200–400px), carga progresiva en lotes de 8
- Animación de "emergencia" al aparecer
- Click en imagen → entra al modo scroll

**Modo scroll**:
- Scroll horizontal con imágenes centradas (60vh × 60vh)
- Contador de posición en esquina
- URLs con hash para compartir (`#scroll-{index}`)
- Soporte de historial del navegador (atrás/adelante)
- Click fuera de imagen → vuelve al mosaico

Flashbook scrollea hacia la izquierda (CSS `direction: rtl`); tattoo scrollea hacia la derecha.

### Booking (`booking.html`)

Formulario de contacto (interfaz en inglés) con campos: name, email, instagram (opcional), location, description e imágenes adjuntas. Validación client-side de email e instagram con errores inline. Los adjuntos se pueden añadir en varias tandas con previsualización de miniatura y botón ✕ para quitar (máx. 10 archivos, 5 MB c/u, 9 MB total — Formsubmit limita a 10 MB). Envío híbrido: sin adjuntos se manda vía AJAX (confirmación inline); con adjuntos se hace submit nativo + redirect (`_next?sent=1`) porque Formsubmit no adjunta archivos a través del endpoint AJAX. Ver [`docs/SETUP_FORMSUBMIT.txt`](docs/SETUP_FORMSUBMIT.txt) para cambiar el email destino.

## Navegación

Sistema posicional unificado con 4 posiciones posibles:

| Posición | Clase CSS | Rotación | Uso |
|----------|-----------|----------|-----|
| Arriba | `.pos-top` | 0° | Enlace a home |
| Abajo | `.pos-bottom` | 180° | Enlace a booking |
| Izquierda | `.pos-left` | -90° | Enlace lateral |
| Derecha | `.pos-right` | 90° | Enlace lateral |

Los botones están fijos en los bordes de la pantalla con `position: fixed` y se escalan con `clamp()`.

## Configuración

Todo se gestiona desde `data.json`:

```json
{
  "welcome": { "title": "ViciosTorpes", "background": "..." },
  "sections": {
    "flashbook": { "imageCount": 129, "imagePath": "data/images/flashbook/", "background": "..." },
    "tattoo": { "imageCount": 72, "imagePath": "data/images/tattoo/", "background": "..." }
  },
  "booking": { "title": "How to Book", "background": "..." }
}
```

Para añadir imágenes: subirlas numeradas a la carpeta correspondiente y actualizar `imageCount` en `data.json`.

## Stack

- **HTML5** + **CSS3** — variables CSS, Grid, Flexbox, `dvw`/`dvh`, `clamp()`
- **JavaScript ES6+** — vanilla, async/await, Fetch API
- **Tipografía**: Sofia Sans Extra Condensed (Google Fonts)
- **Imágenes**: formato WebP
- **Formsubmit** — envío de formulario sin backend
- **Zero build** — sin npm, sin bundler, sin transpilación

## Paleta

| Color | Hex | Uso |
|-------|-----|-----|
| Fondo | `#0f0f12` | Background global |
| Texto | `#E6E6E6` | Color principal de texto |
| Acento | `#c81e1e` | Botones, estados activos |
| Hover | `#ff3c3c` | Estados hover |

## Desarrollo

Abrir directamente en el navegador o servir con cualquier servidor estático:

```bash
python3 -m http.server 8000
```

Despliegue directo en GitHub Pages, Netlify, Vercel o cualquier hosting estático.

## Responsive

Breakpoints en todas las páginas:
- **Desktop**: > 1024px
- **Tablet**: 768px – 1024px
- **Mobile**: < 768px
- **Small**: < 480px

Usa unidades dinámicas de viewport (`dvw`/`dvh`) y `clamp()` para tipografía fluida.

---

**Diseño y desarrollo**: manu (@meowrhino)
