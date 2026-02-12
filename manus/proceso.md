# Proceso de Desarrollo - viciostorpesV2

---

## 12 de febrero de 2026 - 04:40 GMT+1

### Análisis de Diferencias de Navegación con rikamichie

**Sinopsis:** Análisis comparativo entre los sistemas de navegación de viciostorpesV2 y rikamichie para identificar por qué no funcionan de la misma manera.

**Proceso Realizado:**

He realizado un análisis exhaustivo de ambos repositorios para entender las diferencias fundamentales en sus sistemas de navegación. El objetivo era identificar por qué **viciostorpesV2** no replica la experiencia de navegación fluida de **rikamichie**.

#### Hallazgos Principales

**Arquitectura de rikamichie:**
- Implementa una **Single Page Application (SPA)** con un sistema de grid navegable
- Todas las secciones se cargan en un único `index.html` dentro de un contenedor `#content`
- Las celdas del grid se muestran/ocultan mediante CSS (opacity y pointer-events)
- La navegación se gestiona mediante JavaScript cambiando las variables de posición (posX, posY)
- Los botones de navegación se generan dinámicamente según el contexto
- El contenido de cada celda se carga mediante fetch desde archivos parciales HTML
- Las transiciones son suaves gracias a CSS transitions

**Arquitectura de viciostorpesV2:**
- Implementa una **Multi-Page Application (MPA)** tradicional
- Cada sección es un archivo HTML independiente (index.html, flashbook.html, tattoo.html, booking.html)
- La navegación se realiza mediante enlaces `<a href>` que recargan la página completa
- No existe un sistema de grid ni gestión de estado
- Los botones son enlaces estáticos predefinidos
- Cada navegación implica una recarga completa del navegador

#### Diferencia Fundamental

La diferencia clave es que **rikamichie** mantiene todas las pantallas cargadas en memoria y solo cambia cuál es visible, mientras que **viciostorpesV2** carga páginas HTML completamente nuevas en cada navegación. Esto hace imposible tener transiciones suaves y una experiencia fluida sin refactorizar la arquitectura.

#### Soluciones Propuestas

**Opción 1 - Refactorización como SPA (Recomendada):**
- Convertir viciostorpesV2 en una SPA siguiendo el modelo de rikamichie
- Crear un único index.html con un sistema de grid
- Convertir las páginas actuales en parciales HTML
- Implementar el sistema de celdas con clases CSS
- Crear funciones de navegación y actualización de vista
- Generar botones dinámicamente según el contexto

**Opción 2 - Mejora Incremental:**
- Mantener la arquitectura MPA pero mejorar la experiencia
- Implementar View Transitions API para transiciones entre páginas
- Añadir sistema de navegación consistente
- Precarga de páginas siguientes
- Animaciones CSS para entrada/salida

#### Conclusión

Para replicar exactamente la navegación de **rikamichie**, es necesario refactorizar **viciostorpesV2** como una SPA. La arquitectura actual de múltiples páginas HTML independientes no permite lograr la misma fluidez y experiencia de usuario sin cambios estructurales significativos.

**Archivos Analizados:**
- `/home/ubuntu/viciostorpesV2/index.html`
- `/home/ubuntu/viciostorpesV2/js/welcome.js`
- `/home/ubuntu/viciostorpesV2/css/main.css`
- `/home/ubuntu/viciostorpesV2/css/welcome.css`
- `/home/ubuntu/rikamichie/index.html`
- `/home/ubuntu/rikamichie/script.js`
- `/home/ubuntu/rikamichie/style.css`

**Documentación Generada:**
- Análisis detallado en `/home/ubuntu/analisis_navegacion.md`

---

---

## 12 de febrero de 2026 - 05:15 GMT+1

### Implementación de Sistema de Navegación Posicional

**Sinopsis:** Implementación de un sistema de navegación donde los botones aparecen en el lado correspondiente según su dirección (izquierda, derecha, arriba, abajo), similar al sistema de rikamichie pero adaptado a la arquitectura MPA de viciostorpesV2.

**Proceso Realizado:**

Tras el análisis previo que identificó las diferencias arquitectónicas entre ambos repositorios, el usuario solicitó una solución intermedia: mantener la estructura de múltiples páginas HTML pero implementar un sistema de navegación posicional donde los botones aparezcan en el lado que "les toca" según la lógica espacial del sitio.

#### Concepto de Grid Lógico

Se definió un grid lógico conceptual para viciostorpesV2:

```
        [home]
          |
[flashbook] - [home] - [tattoo]
          |
    [how to book]
```

Este grid determina la posición de los botones de navegación en cada página según la relación espacial entre las secciones.

#### Implementación Técnica

**1. Nuevo archivo CSS: `navigation.css`**

Se creó un archivo CSS modular y separado que define estilos para botones de navegación posicional. Este archivo incluye:

- **Clases posicionales**: `.pos-top`, `.pos-bottom`, `.pos-left`, `.pos-right` que posicionan los botones en los bordes correspondientes de la pantalla
- **Rotaciones contextuales**: Los botones laterales se rotan 90° (izquierda: -90°, derecha: +90°), el botón inferior se rota 180°
- **Botón home fijo**: Clase `.nav-btn-home` para el botón de retorno que siempre aparece en la esquina superior izquierda
- **Transiciones suaves**: Efectos hover que escalan los botones sin perder la rotación
- **Diseño responsive**: Media queries para ajustar tamaños y posiciones en dispositivos móviles

**2. Actualización de archivos HTML**

Se modificaron todos los archivos HTML del proyecto para incluir el nuevo sistema:

**index.html (página principal):**
- Añadido link a `navigation.css`
- Creado contenedor `.nav-container` con tres botones:
  - `flashbook` → posición izquierda (`.pos-left`)
  - `tattoo` → posición derecha (`.pos-right`)
  - `how to book` → posición abajo (`.pos-bottom`)

**flashbook.html (galería izquierda):**
- Añadido link a `navigation.css`
- Botón home en esquina superior izquierda (`.nav-btn-home`)
- Contenedor `.nav-container` con:
  - `home` → posición derecha (`.pos-right`) porque flashbook está a la izquierda
  - `how to book` → posición abajo (`.pos-bottom`)

**tattoo.html (galería derecha):**
- Añadido link a `navigation.css`
- Botón home en esquina superior izquierda (`.nav-btn-home`)
- Contenedor `.nav-container` con:
  - `home` → posición izquierda (`.pos-left`) porque tattoo está a la derecha
  - `how to book` → posición abajo (`.pos-bottom`)

**booking.html (página inferior):**
- Añadido link a `navigation.css`
- Botón home en esquina superior izquierda (`.nav-btn-home`)
- Contenedor `.nav-container` con:
  - `home` → posición arriba (`.pos-top`) porque booking está abajo

#### Lógica de Posicionamiento

La lógica espacial implementada es:

1. **Desde home**: Los botones apuntan hacia donde están las secciones (flashbook a la izquierda, tattoo a la derecha, booking abajo)
2. **Desde flashbook**: Home está a la derecha (porque flashbook está a la izquierda del home)
3. **Desde tattoo**: Home está a la izquierda (porque tattoo está a la derecha del home)
4. **Desde booking**: Home está arriba (porque booking está abajo del home)

Esta lógica crea una navegación intuitiva donde el usuario entiende visualmente la relación espacial entre las secciones, aunque técnicamente sigan siendo páginas HTML separadas.

#### Ventajas de Esta Solución

- **Mantiene la arquitectura actual**: No requiere refactorización completa a SPA
- **Mejora la UX**: Navegación más intuitiva y visualmente coherente
- **Modular y mantenible**: CSS separado, fácil de modificar
- **Consistencia visual**: Similar a rikamichie en concepto, adaptado a la estructura de viciostorpesV2
- **Responsive**: Funciona correctamente en móviles y escritorio

#### Archivos Modificados

- **Nuevo**: `/css/navigation.css`
- **Modificado**: `/index.html`
- **Modificado**: `/flashbook.html`
- **Modificado**: `/tattoo.html`
- **Modificado**: `/booking.html`

#### Próximos Pasos Sugeridos

Si el usuario desea una experiencia aún más fluida, se podría implementar en una fase posterior:

1. View Transitions API para transiciones suaves entre páginas
2. Precarga de páginas siguientes con JavaScript
3. Animaciones de entrada/salida de contenido
4. O bien, refactorización completa a SPA como se propuso inicialmente

---
