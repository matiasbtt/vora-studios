# VORA STUDIOS — mundo visual

Fuente de verdad de la identidad: `../contexto_proyecto.json`. Este archivo registra las
decisiones visuales del sitio y por qué se tomaron.

## Principio

El negro de la página es el mismo negro del video. La flor no se muestra dentro de un
reproductor: flota en la interfaz. Todo lo demás — retícula, tipografía, movimiento —
existe para no competir con ella.

## Modo

**Persuade.** El visitante decide si escribe. El diseño es el argumento: si el estudio dice
que usa IA como material creativo, la página tiene que demostrarlo antes que afirmarlo.

## Color

| Token | Valor | Uso |
|---|---|---|
| `--void` | `#000000` | Columna del herbario. Negro puro, no gris oscuro, para fundirse con el clip. |
| `--page` | `#0A0A0B` | Columna de contenido. Un punto por encima del negro: crea plano sin costura visible. |
| `--ink` | `#F4F0E9` | Marfil. Texto principal. 17,2:1. |
| `--ink-2` | `#B3ABA0` | Texto secundario. 8,6:1. |
| `--ink-3` | `#857E75` | Etiquetas y metadatos. 4,9:1. |
| `--bloom` | `#D8B4A8` | Rosa empolvado. Acento único. |
| `--line` | `rgba(244,240,233,.10)` | Filetes. |

Los secundarios son marfiles desaturados, nunca grises neutros: se derivan del mismo tono
cálido del papel. El acento sale directo de `paleta.colores_preferidos` del JSON y aparece
poco: el riel activo, la etiqueta «no registrada», la regla que traza al entrar en un
bloque, los enlaces de contacto en hover.

## Tipografía

**Fraunces** para lo que se lee como voz: titulares, nombres de servicio, latines,
logotipo. Se usa con `WONK 1` y `SOFT 40–50`, los ejes que le dan el trazo irregular y
ligeramente torcido. Es la elección conceptual del sitio: los mismos ejes que hacen que una
tipografía parezca cortada a mano son los que hacen que el papel parezca papel.

**Instrument Sans** para todo lo demás. Neutra, humanista, sin personalidad que discuta.

Escala: display `clamp(2.75rem, 5.4vw, 4.9rem)` con tracking −0.035em; h2
`clamp(1.9rem, 3.1vw, 3rem)`; texto 17 px / 1.6. Medida de lectura 38rem (≈ 62–75 caracteres
por línea según el tamaño). Números siempre tabulares.

## Retícula

46 / 54 en escritorio. La columna del herbario es fija; la de contenido corre. Cada bloque
ocupa una pantalla completa, lo que empareja un tramo de flores con un tramo de lectura.

Ancho definido en `%` y no en `vw`: `vw` incluye la barra de scroll y desalinea las dos
columnas por el ancho exacto de la barra.

## Movimiento

Un gesto por tipo de bloque, no la misma entrada siete veces:

- **Hero** — las líneas del titular suben desde su propia caja (`overflow: hidden` + translate).
- **Bloques de lectura** — una regla en rosa empolvado se traza de izquierda a derecha y
  después entra el texto.
- **Bloques de lista** — las filas entran escalonadas cada 60 ms.
- **Contacto** — el titular se asienta y los canales llegan detrás.

El cruce entre especímenes es opacidad pura, 1100 ms, `ease`. Sin escala, sin blur, sin
nada que pueda leerse como inestabilidad de cámara: `estabilidad_de_imagen` del JSON tiene
prioridad ABSOLUTA y esa regla vale también para la interfaz que rodea al video.

Todo lo pulsable baja a `scale(.97)` en `:active`. Los hover están detrás de
`@media (hover: hover) and (pointer: fine)`.

Con `prefers-reduced-motion` se conservan los fundidos y se quita todo desplazamiento; el
herbario reproduce una flor por bloque y deja de encadenar.

## Lo que este mundo no usa

Sin tarjetas como estructura de página. Sin antetítulos. Sin degradados en texto. Sin
cristal decorativo — el desenfoque de la barra superior existe porque hay contenido
pasando por debajo. Sin iconos: no hay ninguno, y si los hubiera serían dibujados, no
emoji. Sin numeración de secciones salvo en Proceso, donde la secuencia sí es información.

Los números del espécimen (`09/28`) y el riel de 28 marcas tampoco son decoración: dicen en
qué punto de la progresión narrativa está el visitante.
