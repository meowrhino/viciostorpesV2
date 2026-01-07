# Análisis y Plan para ViciosTorpes V2

## Estructura Actual (V1)

### Arquitectura
- **HTML**: `index.html` con estructura de campo (`#field`) donde se colocan "cartas" de proyectos
- **CSS**: Sistema de variables CSS dinámicas controladas por JS
- **JS**: `main.js` gestiona:
  - Carga de configuración desde `home.json`
  - Sistema de categorías con navegación
  - Temas visuales (fondos, overlays, filtros) por categoría
  - Posicionamiento de proyectos como "cartas" en el viewport
  - Sistema de texto central con flechas para navegar
  - Stickers decorativos (actualmente desactivados)

### Características Clave V1
1. **Sistema de temas dinámico**: Fondos e imágenes cambian según categoría activa
2. **Posicionamiento libre**: Las cartas se colocan en coordenadas específicas (dvh/dvw)
3. **Navegación por categorías**: Botones inferiores filtran contenido
4. **Texto central rotativo**: Mensajes que cambian con flechas

### Materiales Disponibles

#### Imágenes de Fondo
- `home.jpg` - Imagen de valla con plantas (estética urbana/naturaleza)
- Varias imágenes en `imagenes fondos/` (DSC00023.webp, etc.)
- Carpeta `oscurecer/` con versiones procesadas

#### Contenido por Sección
1. **Flashbook**: 
   - `flashbook.webp` (imagen principal)
   - `flashbook/` - 22 imágenes webp
   - `flashbook_scroll/` - **133 imágenes webp** (el mosaico principal)

2. **Tattoo**:
   - `tattoo.jpg` 
   - `tattoo/` - 10 imágenes webp
   - `tattoo_scroll/` (vacía)

3. **Projects**:
   - `projects/` - 2 imágenes webp

4. **How to Book**:
   - `howtobook/` (vacía)

---

## Propuesta para V2

### Concepto General
**Home como "portal visual"**: En lugar de cartas dispersas, la home muestra las imágenes de fondo de cada sección como áreas clickeables que te transportan a esa sección.

### Arquitectura Propuesta

#### 1. **Home (index.html)**
```
┌─────────────────────────────────┐
│                                 │
│   [Flashbook]  [Tattoo]        │
│                                 │
│   [Projects]   [How to Book]   │
│                                 │
└─────────────────────────────────┘
```
- Grid de 4 áreas clickeables
- Cada área muestra su imagen de fondo característica
- Al hover: efecto visual (zoom, overlay, etc.)
- Al click: navegación a la sección

#### 2. **Flashbook (flashbook.html)**

**Vista Principal - Mosaico Scrolleable**:
- Canvas grande (ej: 3000x3000px o más)
- 133 imágenes de `flashbook_scroll/` distribuidas aleatoriamente
- **Algoritmo de colocación sin superposición**:
  - Usar packing algorithm (bin packing o random placement con collision detection)
  - Cada imagen tiene su posición fija pero visualmente "natural"
- **Efecto de movimiento**: 
  - Solo las imágenes se mueven (parallax ligero o animación sutil)
  - El usuario scrollea para explorar el mosaico
- **Interacción**: Click en imagen → página de detalle

**Vista Detalle**:
- Mismo fondo que el mosaico
- Imagen seleccionada en grande
- Galería de todas las imágenes de `flashbook_scroll/` (thumbnails o carrusel)
- Navegación entre imágenes

#### 3. **Tattoo (tattoo.html)**
- Mantener estructura actual (de momento)
- Galería simple con las 10 imágenes

#### 4. **Projects (projects.html)**
- 2-3 items (links)
- Cada uno es un botón/carta que lleva a su proyecto
- Diseño minimalista

#### 5. **How to Book (booking.html)**
- Formulario sencillo:
  - Nombre
  - Email
  - Teléfono (opcional)
  - Tipo de trabajo (Tattoo/Flashbook/Proyecto)
  - Descripción/Mensaje
  - Fecha preferida
  - Botón enviar

---

## Simplificaciones y Mejoras

### Qué Mantener de V1
✅ **Sistema de variables CSS**: Funciona muy bien para temas
✅ **Estructura de carpetas**: `css/`, `js/`, `data/`
✅ **Carga dinámica con JSON**: Permite configuración flexible
✅ **Estética visual**: Fondos, overlays, text-shadow

### Qué Simplificar
🔄 **Eliminar sistema de categorías**: Ya no es necesario en home
🔄 **Eliminar posicionamiento complejo de cartas**: Home será grid simple
🔄 **Eliminar stickers**: Ya estaban desactivados
🔄 **Simplificar navegación**: Cada sección es una página independiente

### Qué Añadir
➕ **Algoritmo de mosaico**: Para flashbook_scroll
➕ **Sistema de routing**: Navegación entre secciones
➕ **Formulario**: Para how to book
➕ **Vista de detalle**: Para imágenes de flashbook

---

## Estructura de Archivos V2

```
viciostorpesV2/
├── index.html              # Home con grid de secciones
├── flashbook.html          # Mosaico scrolleable
├── flashbook-detail.html   # Detalle de imagen
├── tattoo.html            # Galería tattoos
├── projects.html          # Lista de proyectos
├── booking.html           # Formulario
├── css/
│   ├── main.css          # Estilos globales
│   ├── home.css          # Estilos específicos home
│   ├── flashbook.css     # Estilos mosaico
│   └── booking.css       # Estilos formulario
├── js/
│   ├── utils.js          # Utilidades compartidas
│   ├── home.js           # Lógica home
│   ├── flashbook.js      # Lógica mosaico + packing
│   └── booking.js        # Validación formulario
├── data/
│   ├── images/           # Todas las imágenes organizadas
│   │   ├── backgrounds/
│   │   ├── flashbook/
│   │   ├── flashbook_scroll/
│   │   ├── tattoo/
│   │   └── projects/
│   └── config.json       # Configuración general
└── README.md
```

---

## Algoritmo para Mosaico de Flashbook

### Opción 1: Random Placement con Collision Detection
```javascript
// Pseudocódigo
images = loadImages('flashbook_scroll/')
canvas = { width: 3000, height: 3000 }
placed = []

for each image in images:
  attempts = 0
  while attempts < 100:
    x = random(0, canvas.width - image.width)
    y = random(0, canvas.height - image.height)
    
    if !collidesWith(x, y, image, placed):
      placed.push({ image, x, y })
      break
    
    attempts++
```

### Opción 2: Grid con Variación
```javascript
// Crear grid base pero con offsets aleatorios
gridSize = 250 // px
for row in rows:
  for col in cols:
    baseX = col * gridSize
    baseY = row * gridSize
    offsetX = random(-50, 50)
    offsetY = random(-50, 50)
    place(image, baseX + offsetX, baseY + offsetY)
```

### Efecto de Movimiento
```css
/* Animación sutil en las imágenes */
.mosaic-image {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
```

---

## Preguntas Pendientes

1. **Flashbook scroll**: ¿Efecto de movimiento específico? (parallax, float, etc.)
2. **Detalle de imagen**: ¿Qué mostrar además de la imagen ampliada?
3. **Proyectos**: ¿Links externos o páginas internas?
4. **Formulario**: ¿Campos específicos que necesitas?
5. **Navegación**: ¿Menú fijo en todas las páginas o botón "volver"?

---

## Próximos Pasos

1. ✅ Crear repositorio `viciostorpesV2`
2. ✅ Copiar imágenes organizadas
3. ⏳ Implementar home con grid de secciones
4. ⏳ Desarrollar algoritmo de mosaico para flashbook
5. ⏳ Crear formulario de booking
6. ⏳ Adaptar sección de tattoos
7. ⏳ Implementar proyectos
