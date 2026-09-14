# Vora Studios — sitio web

Estructura de la página. HTML + CSS + JS estático, sin build, sin dependencias.
Se sube tal cual a GitHub Pages, Netlify o cualquier hosting.

```bash
python -m http.server 5173 --directory "Vora Proyect/web"
```

---

## Cómo está armada

Dos columnas fijas en escritorio:

- **Izquierda (46 %)** — el herbario. Negro puro, una flor a la vez, la ficha del
  espécimen debajo y un riel de 28 marcas que dice en qué punto del recorrido estás.
- **Derecha (54 %)** — la página. Fondo `#0A0A0B`, siete bloques de una pantalla cada uno.

En pantallas de 900 px o menos el herbario deja de ser columna y pasa a ser una franja
fija arriba (42 svh); el contenido corre por debajo y la flor sigue siempre a la vista.

## El herbario corre solo

**El herbario es una proyección, no un indicador de scroll.** Cada clip se ve entero —unos
diez segundos—, se disuelve durante un segundo y entra el siguiente, las 28 en orden y en
bucle. **El scroll no lo toca:** la flor se queda mientras bajas, y ese aguante es lo que le
da el aire de película.

El orden es el de `assets/js/flores.js`, que sigue la `progresion_narrativa_del_video` de
`contexto_proyecto.json`: flores reales reconocibles → especies andinas y bolivianas →
reinterpretaciones → especies inventadas → imposibles → vuelta al capullo del inicio.

Para reordenar, mover o añadir especies se toca **solo** ese archivo. No hay que tocar el HTML.

El encadenado va en el `ended` del video. Hay un relevo por tiempo (`programarRelevo`) como
red de seguridad: si `ended` no llega —autoplay bloqueado, clip que no carga, movimiento
reducido— el herbario igual avanza y no se congela.

**La cuenta que conviene tener presente:** a diez segundos por espécimen, ver las 28 toma
unos **4,6 minutos**. Llegar al pie de la página ya no equivale a haber visto la colección;
quien baje en un minuto verá seis o siete. Es el precio de que la flor aguante, y fue una
decisión deliberada. Si hiciera falta apurar el recorrido sin volver a atarlo al scroll, la
palanca es la duración de los clips —acelerarlos o recortarles la cola en
`tools/build-flores.sh`—, no el motor.

**Dos diseños anteriores, por si vuelve la duda.** El primero le daba cuatro flores a cada
bloque y solo encadenaba si el visitante se quedaba quieto unos 40 segundos: bajando normal
se veían siete de veintiocho. El segundo ataba el índice a la posición del scroll, con un
mínimo de 450 ms entre cambios: se veían las 28, pero la flor saltaba cada medio segundo
mientras bajabas, que es exactamente lo contrario de lo que se busca acá.

## Los videos

Los 28 clips originales (`VOLUTA MATERIAL/material videos`) son 1280×720, 16:9, y traen
mucho negro vacío a los costados. `tools/build-flores.sh` recorta ese vacío, escala a
792×648, aplasta los negros a cero y comprime a H.264 sin audio:

```bash
bash tools/build-flores.sh
```

Salida: `assets/video/flores/` y `assets/video/posters/`.

Dos detalles que importan y no son obvios:

- **El aplastado de negros no es cosmético.** Sin él la compresión deja el fondo en un gris
  muy oscuro y el clip se lee como un rectángulo pegado sobre la columna negra —
  exactamente lo que el JSON pide evitar.
- **El cuadro va difuminado en los bordes** (`--feather` en `.stage__frame`). Además de
  disolver el borde, hace que el tallo se desvanezca en vez de quedar cortado en seco.
- **El recorte está medido, no estimado.** Se corrió `cropdetect` sobre los últimos dos
  segundos de los 28 clips —con los negros ya aplastados, porque si no detecta ruido de
  compresión en todo el cuadro— y se tomó la **unión** de los límites: x de 216 a 1056,
  y de 0 a 720. El recorte `880:720:200:0` cubre esa unión con 16 px de margen a la
  izquierda y 24 a la derecha, así que ninguna de las 28 pierde un pétalo. Lo que se va son
  400 px de negro vacío, el 31 % del ancho. Un recorte medido sobre una sola flor no sirve:
  entre la más ancha (x hasta 1056) y la más angosta hay 224 px de diferencia.
  El cuadro CSS es `aspect-ratio: 11/9` con `object-fit: contain`, la misma proporción del
  recorte. Para volver a medir: `scratchpad/medir-todos.sh`.
- **El 1:1 que hubo antes sí cortaba.** Tomaba 280–1000 cuando la rosa llega a 1056. La
  `jerarquia_de_prioridades` del JSON zanja el empate — «flor completamente visible y sin
  recortes» es la 4, «composición 1:1» es la 6.

En memoria solo hay dos `<video>`: el que se ve y el siguiente precargado.

**El índice manda, el video sigue.** `show()` mueve `current`, la ficha y el riel **al
instante**, y recién después pide el clip. Es deliberado: con el motor viejo `current` solo
avanzaba dentro del cruce de video, y ese cruce se cancelaba solo —cada `show()` nuevo
incrementa `token`, y un clip tarda más en cargar que el mínimo que había entre cambios—,
así que ningún cruce terminaba y se veía una sola flor en todo el recorrido.

## Contacto: formulario, WhatsApp y cobro

**El formulario** vive en `#contacto`. Captura nombre, WhatsApp, correo, ciudad y tipo de
proyecto, más un detalle opcional. Valida en el navegador con mensajes que nombran el
problema y la salida, no un «campo inválido».

Tiene un comportamiento que conviene conocer: **mientras `CRM_ENDPOINT` esté vacío en
`assets/js/vora.js`, el formulario arma un mensaje de WhatsApp con todos los datos y lo
abre.** Funciona desde el primer día sin backend.

El receptor ya está escrito y vive **dentro del CRM**, no acá: es el `doPost()` de
`Smile Importer Proyect/crm/Vora.gs`. Para enchufarlo:

1. Subir `Vora.gs` al proyecto Apps Script del CRM (ver su `INSTALACION.md`).
2. Publicarlo como app web con acceso «Cualquiera» y copiar la URL `/exec`.
3. Ponerla en `CRM_ENDPOINT`.

A partir de ahí cada consulta entra como ficha en la pestaña `Vora_Clientes` con estado
«Nuevo», aparece en el panel del CRM bajo *Consultas sin contactar*, y dispara un correo con
los links de respuesta ya armados. Si el envío falla, el mensaje de error ofrece WhatsApp con
los datos ya escritos: el formulario puede caerse, el cliente no se pierde.

Detalle técnico que suele salir mal: el `POST` manda `Content-Type: text/plain` a propósito.
Es lo que evita el preflight de CORS, que Apps Script no sabe responder. El cuerpo sigue
siendo JSON.

**El botón de WhatsApp** aparece en tres lugares: una franja antes del formulario, el botón
flotante y el mensaje de error. El número y el saludo se arman en JavaScript (`WA_NUMERO`),
así que el número no queda escrito en el HTML y el saludo cambia con el idioma.

El flotante sale pasado el hero y **se retira en `#contacto`**, donde ya hay un botón grande:
si se quedara, taparía el formulario y repetiría la misma acción.

**El cobro** está en `pago.html`, una página aparte sin enlace en el menú — se la mandas al
cliente por WhatsApp cuando cierran. Lleva el QR, cuatro pasos y un botón «Ya hice el pago»
que abre WhatsApp pidiendo el comprobante. Para activarla, generar el QR de cobro desde la
app del banco (con monto abierto, acepta pagos múltiples) y guardarlo como
`assets/img/qr-vora.png`. Mientras no exista, la página muestra un aviso en vez de una
imagen rota.

## Idiomas

El español vive en el HTML (es lo que se indexa y lo que se ve sin JS). El inglés es una
capa: `assets/js/i18n.js`, indexado por los `data-i18n` del HTML. El botón ES/EN guarda la
elección en `localStorage`.

Para cambiar un texto en español se edita el HTML; el inglés, el diccionario.

## Tipografía

Auto-alojada en `assets/fonts/`, sin llamadas a Google.

- **Fraunces** (variable, ejes `SOFT` y `WONK`) para titulares, nombres y latines. Sus ejes
  de irregularidad son el equivalente tipográfico del borde cortado a mano.
- **Instrument Sans** (variable) para texto, etiquetas y navegación.

## Qué falta completar

Todo el contenido es provisional y está marcado para reemplazar:

- **Logo** — hoy es un logotipo tipográfico (`.mark`). Cuando exista el símbolo, entra ahí.
- **Copy** — titulares, manifiesto, servicios, proceso y textos del estudio.
- **Trabajo** — tres filas de relleno, sin imágenes ni enlaces. Faltan los casos reales.
- **Contacto** — correo y WhatsApp ya son los reales; falta el usuario de Instagram, que
  hoy apunta a un enlace vacío.
- **Meta social** — falta `og:image` y la imagen de compartir.
- **Favicon**.

## Desviación pendiente contra `contexto_proyecto.json`

`composicion` pide la flor al 20–30 % de la altura del cuadro, con mucho negro alrededor y
cámara a ~45° desde arriba. Los 28 clips están de frente, y con el recorte la flor ocupa
bastante más que eso.

Conviene tenerlo claro: **el recorte aleja el resultado de esa regla, y fue una decisión
explícita.** Se pidió acercar la flor y sacar el negro vacío. Lo que el recorte sí respeta
es la prioridad 4, «flor completamente visible y sin recortes»: está medido sobre las 28 y
ninguna pierde un pétalo.

Lo que queda abierto es el encuadre de origen —el ángulo frontal y cuánto cuadro ocupa la
flor al filmar—, y eso no lo arregla ningún reencode. Hay dos salidas: reencuadrar más
abierto al generar la próxima tanda, o ajustar la regla del JSON a lo que se está
produciendo. Es una decisión de dirección, no técnica.
