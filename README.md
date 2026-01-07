# ViciosTorpes V2

Portfolio interactivo de Marc con mosaico scrolleable de flashbook, galería de tattoos, proyectos y formulario de contacto.

## Estructura

```
viciostorpesV2/
├── index.html              # Home con grid de secciones clickeables
├── flashbook.html          # Mosaico scrolleable de 133 imágenes
├── flashbook-detail.html   # Vista detalle de imagen
├── tattoo.html            # Galería de tattoos
├── projects.html          # Lista de proyectos
├── booking.html           # Formulario de contacto/cita
├── css/                   # Estilos
├── js/                    # JavaScript
└── data/
    └── images/            # Todas las imágenes organizadas
        ├── backgrounds/   # Imágenes de fondo (11)
        ├── flashbook/     # Galería flashbook (22)
        ├── flashbook_scroll/ # Mosaico principal (133)
        ├── tattoo/        # Galería tattoos (10)
        ├── projects/      # Imágenes proyectos (2)
        └── howtobook/     # Recursos booking
```

## Características V2

### Home
- Grid visual con 4 áreas clickeables
- Cada área muestra su imagen de fondo característica
- Navegación directa a cada sección

### Flashbook
- Canvas grande scrolleable con mosaico de 133 imágenes
- Distribución aleatoria sin superposición
- Efecto de movimiento en las imágenes
- Click en imagen → vista detalle

### Tattoo
- Galería simple de 10 tatuajes

### Projects
- 2-3 proyectos con links

### How to Book
- Formulario de contacto/cita
- Campos: nombre, email, tipo de trabajo, descripción, fecha

## Tecnologías

- HTML5 + CSS3 (variables CSS)
- JavaScript vanilla
- Sin frameworks (siguiendo filosofía del proyecto original)

## Desarrollo

Ver `ANALISIS_V2.md` para detalles técnicos y arquitectura.

---

**Diseño y desarrollo**: manu (@meowrhino)
**Versión**: 2.0 (en desarrollo)
