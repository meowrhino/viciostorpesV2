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

---

## 12 de febrero de 2026 - 05:35 GMT+1

### Sistema de Carga Progresiva con Animación de Emergencia

**Sinopsis:** Implementación de un sistema de carga progresiva de imágenes en las galerías (flashbook y tattoo) donde las imágenes van emergiendo conforme se cargan, mejorando la experiencia de usuario y evitando tiempos de espera largos.

**Proceso Realizado:**

El usuario solicitó que las imágenes de las galerías fueran "emergiendo" conforme se cargan, en lugar de esperar a que todas estén listas. Esto es especialmente importante dado el gran volumen de imágenes (129 en flashbook, 72 en tattoo), y confirma que la decisión de mantener la arquitectura MPA es correcta para este proyecto.

#### Análisis del Sistema Anterior

El código original en `gallery.js` cargaba las imágenes de forma secuencial con `await` en cada iteración, lo que significaba que cada imagen debía cargarse completamente antes de pasar a la siguiente. Aunque había una animación `fadeIn`, esta se aplicaba individualmente a cada imagen después de cargarla, creando un efecto de aparición lenta y secuencial.

#### Implementación del Sistema de Carga Progresiva

**1. Carga por Lotes (Batch Loading)**

Se refactorizó el sistema para cargar imágenes en lotes paralelos:

- **Tamaño de lote**: 8 imágenes por lote (configurable en `MOSAIC.batchSize`)
- **Carga paralela**: Dentro de cada lote, las imágenes se cargan simultáneamente usando `Promise.all()`
- **Procesamiento secuencial de lotes**: Los lotes se procesan uno tras otro para evitar saturar la red y el navegador

**Código clave:**

```javascript
// Split images into batches
for (let i = 0; i < shuffled.length; i += MOSAIC.batchSize) {
  const batch = shuffled.slice(i, i + MOSAIC.batchSize);
  const batchMaxHeight = await loadBatch(batch, placed, mosaic);
  maxHeight = Math.max(maxHeight, batchMaxHeight);
  
  // Update mosaic height after each batch
  mosaic.style.height = (maxHeight + MOSAIC.padding * 2) + 'px';
  
  // Small delay between batches for smoother emergence effect
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

**2. Animación de Emergencia Mejorada**

Se reemplazó la simple animación `fadeIn` por una animación más dinámica y orgánica:

**Estado inicial** (`.mosaic-image`):
- `opacity: 0` → Invisible
- `transform: scale(0.8) translateY(20px)` → Ligeramente reducida y desplazada hacia abajo

**Estado emergido** (`.mosaic-image.emerged`):
- `opacity: 1` → Completamente visible
- `transform: scale(1) translateY(0)` → Tamaño completo y posición final

**Transición**:
- `transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)`
- La función de easing `cubic-bezier(0.34, 1.56, 0.64, 1)` crea un efecto de "rebote" suave que hace que las imágenes "emerjan" con un movimiento elástico y natural

**3. Trigger de la Animación**

La clase `.emerged` se añade a cada imagen después de que se inserta en el DOM, usando `requestAnimationFrame` para asegurar que el navegador ha procesado el estado inicial antes de aplicar la transición:

```javascript
mosaic.appendChild(img);

// Trigger emergence animation after a small delay
requestAnimationFrame(() => {
  img.classList.add('emerged');
});
```

**4. Actualización Dinámica de la Altura del Contenedor**

El contenedor del mosaic (`#mosaic`) se actualiza en altura después de cada lote, permitiendo que el scroll funcione correctamente incluso mientras las imágenes siguen cargando:

```javascript
mosaic.style.height = (maxHeight + MOSAIC.padding * 2) + 'px';
```

#### Ventajas del Sistema Implementado

**Rendimiento mejorado:**
- Las imágenes se cargan en paralelo dentro de cada lote, reduciendo el tiempo total de carga
- El usuario puede empezar a ver contenido inmediatamente sin esperar a que todo esté listo
- La carga por lotes evita saturar la conexión de red

**Experiencia de usuario superior:**
- Efecto visual atractivo y orgánico de "emergencia" de las imágenes
- Sensación de dinamismo y fluidez
- Feedback visual constante de que el contenido se está cargando

**Mantenibilidad:**
- Código modular con funciones separadas (`loadImage`, `loadBatch`)
- Configuración centralizada en el objeto `MOSAIC`
- Fácil ajustar el tamaño de lote o los parámetros de animación

#### Archivos Modificados

- **`js/gallery.js`**: Refactorización completa con sistema de carga por lotes
- **`css/gallery.css`**: Nueva animación de emergencia con transform y cubic-bezier

#### Detalles Técnicos

**Función cubic-bezier explicada:**
- `cubic-bezier(0.34, 1.56, 0.64, 1)` crea una curva de animación con "overshoot"
- El valor `1.56` en el segundo parámetro hace que la animación sobrepase ligeramente su valor final antes de volver
- Esto crea el efecto de "rebote" elástico que hace que las imágenes parezcan "emerger" con energía

**Delay entre lotes:**
- `await new Promise(resolve => setTimeout(resolve, 100))` añade 100ms entre lotes
- Este pequeño delay hace que la emergencia sea más perceptible y agradable visualmente
- Sin este delay, todos los lotes se cargarían tan rápido que el efecto se perdería

#### Commit Realizado

```
commit 4835189
Implementar navegación posicional y carga progresiva de imágenes con animación de emergencia

- Añadido sistema de navegación posicional (navigation.css)
- Implementada carga por lotes en gallery.js
- Nueva animación de emergencia con cubic-bezier
- Actualización dinámica de altura del contenedor
- Documentación en manus/proceso.md
```

Push exitoso a `origin/main` en GitHub.

---
