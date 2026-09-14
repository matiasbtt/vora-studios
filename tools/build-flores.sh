#!/usr/bin/env bash
# Transcodifica los clips originales 1280x720 para la web.
#
# EL RECORTE ESTA MEDIDO, NO ESTIMADO. Se corrio cropdetect sobre los ultimos
# 2 segundos de los 28 clips (con los negros ya aplastados: sin eso cropdetect
# ve ruido de compresion en todo el cuadro) y se tomo la UNION de los limites:
#
#   x de 216 a 1056   y de 0 a 720
#
# El recorte 880x720+200+0 cubre esa union con 16 px de margen a la izquierda
# y 24 a la derecha, asi que NINGUNA flor de las 28 pierde un solo petalo.
# Lo que se va son 400 px de negro vacio en los costados, un 31% del ancho.
#
# El 1:1 de la version vieja cortaba de verdad: tomaba 280-1000 cuando la rosa
# llega a 1056. La jerarquia del JSON resuelve el empate: "flor completamente
# visible y sin recortes" es prioridad 4, "composicion 1:1" es 6.
#
# Salida 792x648 (misma proporcion 11:9 del recorte, sin deformar), negros
# aplastados y H.264 sin audio.
#
# Para volver a medir: scratchpad/medir-todos.sh
set -u
SRC="C:/Users/matia/Downloads/VOLUTA MATERIAL/material videos"
OUT="C:/Users/matia/OneDrive/Documentos/Anthropic/Vora Proyect/web/assets/video"
MAP="C:/Users/matia/AppData/Local/Temp/claude/C--Users-matia-OneDrive-Documentos-Anthropic/981edd28-122e-40a3-9feb-259a334335cb/scratchpad/map.txt"

declare -A SRCFILE
while IFS=' :: ' read -r n rest; do :; done < /dev/null
while read -r line; do
  n="${line%% :: *}"; f="${line#* :: }"
  SRCFILE["$n"]="$f"
done < "$MAP"

# orden narrativo :: indice_origen :: slug
ORDER=(
"28:rosa-marfil" "05:girasol" "07:margarita" "03:lirio-blanco"
"01:narciso" "14:clavel" "10:gerbera" "20:hibisco"
"08:peonia" "09:rosa-silvestre" "06:azafran" "27:lupino-andino"
"13:trillium" "12:alstroemeria" "02:cosmos" "16:masdevallia-rosa"
"15:masdevallia-lavanda" "11:dalia-peonia" "19:camelia-palida" "21:peonia-marfil"
"04:anemona-veteada" "18:anemona-azul" "25:petunia-lavanda" "26:cono-ocre"
"17:estrella-cactus" "24:corola-verde" "23:estrella-crema" "22:clematide-papel"
)

i=0
for entry in "${ORDER[@]}"; do
  i=$((i+1)); nn=$(printf "%02d" $i)
  idx="${entry%%:*}"; slug="${entry#*:}"
  in="$SRC/${SRCFILE[$idx]}"
  [ -f "$in" ] || { echo "FALTA $idx -> $in"; continue; }
  ffmpeg -v error -i "$in" \
    -vf "crop=880:720:200:0,scale=792:648:flags=lanczos,curves=all='0/0 0.07/0 0.4/0.4 1/1'" \
    -c:v libx264 -crf 26 -preset slow -profile:v high -pix_fmt yuv420p \
    -movflags +faststart -an -r 24 -y "$OUT/flores/$nn-$slug.mp4"
  ffmpeg -v error -i "$in" -frames:v 1 \
    -vf "crop=880:720:200:0,scale=792:648:flags=lanczos,curves=all='0/0 0.07/0 0.4/0.4 1/1'" -q:v 5 -y "$OUT/posters/$nn-$slug.jpg"
  echo "ok $nn-$slug"
done
echo "LISTO"
