# Implementación ViciosTorpes V2

## Resumen de Implementación

Se ha creado la versión 2 de ViciosTorpes con una arquitectura simplificada y enfocada en la experiencia visual.

---

## Estructura de Archivos

```
viciostorpesV2/
├── index.html              ✅ Home con grid de 4 secciones
├── flashbook.html          ✅ Mosaico scrolleable
├── tattoo.html            ✅ Galería de tattoos
├── projects.html          ✅ Lista de proyectos
├── booking.html           ✅ Formulario de contacto
├── project1.html          ✅ Detalle proyecto 1
├── project2.html          ✅ Detalle proyecto 2
├── project3.html          ✅ Detalle proyecto 3
├── css/
│   ├── main.css           ✅ Estilos globales
│   ├── home.css           ✅ Grid de secciones
│   ├── flashbook.css      ✅ Mosaico
│   ├── tattoo.css         ✅ Galería tattoos
│   ├── projects.css       ✅ Lista proyectos
│   ├── booking.css        ✅ Formulario
│   └── project-detail.css ✅ Detalle de proyecto
├── js/
│   ├── utils.js           ✅ Utilidades compartidas
│   ├── home.js            ✅ Lógica home
│   ├── flashbook.js       ✅ Algoritmo mosaico
│   ├── tattoo.js          ✅ Galería tattoos
│   ├── projects.js        ✅ Proyectos
│   └── booking.js         ✅ Validación formulario
└── data/
    └── images/            ✅ 162 imágenes organizadas
```

---

## Características Implementadas

### 1. Home (index.html)
- **Grid 2x2** con 4 secciones clickeables
- Cada sección muestra su imagen de fondo característica
- **Efectos hover**: zoom en imagen y título
- **Responsive**: en móvil se convierte en grid vertical
- **Fondos asignados**:
  - Flashbook: `DSC00023.webp`
  - Tattoo: `DSC00156 2.webp`
  - Projects: `DSC00163.webp`
  - Booking: `DSC00210.webp`

### 2. Flashbook (flashbook.html)
- **Mosaico scrolleable** con 126 imágenes
- **Algoritmo de colocación sin colisiones**:
  - Random placement con collision detection
  - Tamaños aleatorios entre 200-400px
  - Padding de 20px entre imágenes
  - Máximo 100 intentos por imagen
  - Si no encuentra espacio, coloca al final
- **Características**:
  - Canvas adaptativo (altura calculada dinámicamente)
  - Imágenes con aspect ratio preservado
  - Hover con zoom y sombra
  - Lazy loading implícito (carga secuencial)
  - Logging en consola del progreso

### 3. Tattoo (tattoo.html)
- **Galería grid** con 10 imágenes
- Grid responsive (auto-fit, minmax)
- Hover con elevación y zoom
- Aspect ratio 3:4 para todas las imágenes

### 4. Projects (projects.html)
- **Lista vertical** de 3 proyectos
- Cada proyecto es una card con:
  - Imagen a la izquierda
  - Título y descripción a la derecha
- Hover con desplazamiento lateral
- Links a páginas individuales de proyecto

### 5. Booking (booking.html)
- **Formulario de contacto** con campos:
  - Nombre (requerido)
  - Email (requerido, validado)
  - Teléfono (opcional)
  - Localidad (requerido)
  - Descripción (requerido)
- **Validación en cliente**:
  - Campos obligatorios
  - Formato de email
  - Mensajes de error/éxito
- **Firma**: meowrhino.studio
- **Simulación de envío** (1.5s delay)
- Estados del botón (enviando, éxito, error)

### 6. Páginas de Proyecto (project1-3.html)
- Páginas placeholder para cada proyecto
- Fondo con imagen del proyecto
- Contenedor para contenido personalizable
- Botón volver a Projects

---

## Decisiones de Diseño

### Simplicidad
✅ **Sin efectos complejos**: Movimiento mínimo, solo hover
✅ **Sin página de detalle en flashbook**: Solo scroll
✅ **Sin navegación global**: Cada página independiente
✅ **Sin frameworks**: HTML, CSS, JS vanilla

### Estética
✅ **Fondos oscurecidos**: `brightness(0.4-0.7)` para legibilidad
✅ **Overlays negros**: `rgba(0,0,0,0.4-0.7)` sobre imágenes
✅ **Text shadow**: `0 1px 3px rgba(0,0,0,1)` en todos los textos
✅ **Glassmorphism**: `backdrop-filter: blur(10px)` en cards y formularios
✅ **Transiciones suaves**: `0.3s ease` en todos los elementos

### Tipografía
✅ **Font**: Sofia Sans Extra Condensed
✅ **Uppercase**: Títulos y botones
✅ **Letter spacing**: 0.05-0.08em para legibilidad
✅ **Responsive**: `clamp()` para tamaños adaptativos

### Colores
✅ **Fondo**: `#0f0f12` (casi negro)
✅ **Texto**: `#E6E6E6` (gris claro)
✅ **Hover**: `#FFFFFF` (blanco)
✅ **Transparencias**: rgba para overlays

---

## Algoritmo de Mosaico (Flashbook)

### Funcionamiento
```javascript
1. Cargar lista de 126 imágenes
2. Mezclar aleatoriamente
3. Para cada imagen:
   a. Generar tamaño aleatorio (200-400px)
   b. Cargar imagen para obtener aspect ratio
   c. Intentar colocar en posición aleatoria (max 100 intentos)
   d. Verificar colisiones con imágenes ya colocadas
   e. Si no hay colisión, colocar
   f. Si no encuentra espacio, colocar al final
4. Ajustar altura del contenedor al final
```

### Optimizaciones
- **Carga secuencial**: Evita saturar el navegador
- **Logging cada 10 imágenes**: Feedback de progreso
- **Aspect ratio preservado**: Imágenes no distorsionadas
- **Padding configurable**: Fácil ajuste de espaciado

---

## Responsive Design

### Breakpoint: 768px

**Móvil (< 768px)**:
- Home: Grid vertical (1 columna)
- Flashbook: Padding reducido, imágenes más pequeñas
- Tattoo: Grid más estrecho (200px min)
- Projects: Cards verticales (imagen arriba)
- Booking: Padding reducido en formulario
- Botón volver: Solo icono, sin texto

**Desktop (≥ 768px)**:
- Home: Grid 2x2
- Flashbook: Mosaico completo
- Tattoo: Grid adaptativo (280px min)
- Projects: Cards horizontales
- Booking: Formulario amplio
- Botón volver: Icono + texto

---

## Próximos Pasos (Opcional)

### Para Producción
1. **Backend para formulario**: Conectar con servicio de email (FormSpree, EmailJS, etc.)
2. **Optimización de imágenes**: Comprimir más si es necesario
3. **Analytics**: Añadir Google Analytics o similar
4. **SEO**: Meta tags, Open Graph, etc.
5. **PWA**: Manifest y service worker para instalación

### Mejoras Futuras
1. **Lightbox en Flashbook**: Modal para ver imágenes en grande
2. **Filtros en Tattoo**: Por estilo, tamaño, etc.
3. **Contenido dinámico**: Cargar desde JSON o CMS
4. **Animaciones**: GSAP o similar para efectos más complejos
5. **Lazy loading real**: Intersection Observer para imágenes

---

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Variables, Grid, Flexbox, Transitions, Backdrop Filter
- **JavaScript ES6+**: Async/await, Promises, Modules
- **Google Fonts**: Sofia Sans Extra Condensed
- **SVG**: Iconos (flecha volver)

---

## Notas Técnicas

### Limitaciones
- **Sin listado dinámico de imágenes**: La lista está hardcodeada en JS (no hay backend)
- **Formulario simulado**: No envía emails realmente (necesita backend)
- **Sin base de datos**: Todo es estático

### Ventajas
- **Hosting simple**: GitHub Pages, Netlify, Vercel
- **Sin dependencias**: No requiere npm, build, etc.
- **Rápido**: Carga instantánea
- **Mantenible**: Código limpio y comentado

---

## Testing

### Checklist
- ✅ Home carga correctamente
- ✅ Navegación entre secciones funciona
- ✅ Flashbook carga las 126 imágenes
- ✅ Tattoo muestra las 10 imágenes
- ✅ Projects muestra los 3 proyectos
- ✅ Booking valida el formulario
- ✅ Botones volver funcionan
- ✅ Responsive en móvil
- ✅ Hover effects funcionan
- ✅ Imágenes de fondo cargan

### Navegadores Recomendados
- Chrome/Edge (últimas versiones)
- Firefox (últimas versiones)
- Safari (últimas versiones)

---

**Desarrollado por**: manu (@meowrhino)  
**Fecha**: Enero 2026  
**Versión**: 2.0
