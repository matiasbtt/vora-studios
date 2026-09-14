/* VORA STUDIOS — herbario digital
 * Orden narrativo definido por progresion_narrativa_del_video (contexto_proyecto.json):
 * observación → endemismo → reinterpretación → invención → imposibilidad → retorno.
 * El orden de este array ES el orden de arriba a abajo de la página.
 */
window.VORA_FLORES = [
  // Fase 1 — la IA observa e interpreta flores reales
  { file: '01-rosa-marfil',        latin: 'Rosa × centifolia',      es: 'Rosa de papel',            en: 'Paper rose',            phase: 1, registered: true },
  { file: '02-girasol',            latin: 'Helianthus annuus',      es: 'Girasol',                  en: 'Sunflower',             phase: 1, registered: true },
  { file: '03-margarita',          latin: 'Leucanthemum vulgare',   es: 'Margarita',                en: 'Oxeye daisy',           phase: 1, registered: true },
  { file: '04-lirio-blanco',       latin: 'Lilium candidum',        es: 'Lirio blanco',             en: 'Madonna lily',          phase: 1, registered: true },
  { file: '05-narciso',            latin: 'Narcissus pseudonarcissus', es: 'Narciso',               en: 'Daffodil',              phase: 1, registered: true },
  { file: '06-clavel',             latin: 'Dianthus caryophyllus',  es: 'Clavel',                   en: 'Carnation',             phase: 1, registered: true },
  { file: '07-gerbera',            latin: 'Gerbera jamesonii',      es: 'Gerbera',                  en: 'Gerbera',               phase: 1, registered: true },
  { file: '08-hibisco',            latin: 'Hibiscus rosa-sinensis', es: 'Hibisco',                  en: 'Hibiscus',              phase: 1, registered: true },

  // Fase 2 — diversidad botánica y especies andinas / bolivianas
  { file: '09-peonia',             latin: 'Paeonia lactiflora',     es: 'Peonía',                   en: 'Peony',                 phase: 2, registered: true },
  { file: '10-rosa-silvestre',     latin: 'Rosa canina',            es: 'Rosa silvestre',           en: 'Dog rose',              phase: 2, registered: true },
  { file: '11-azafran',            latin: 'Crocus sativus',         es: 'Azafrán',                  en: 'Saffron crocus',        phase: 2, registered: true },
  { file: '12-lupino-andino',      latin: 'Lupinus mutabilis',      es: 'Tarwi altiplánico',        en: 'Andean lupin',          phase: 2, registered: true },
  { file: '13-trillium',           latin: 'Trillium grandiflorum',  es: 'Trillium',                 en: 'Wake-robin',            phase: 2, registered: true },
  { file: '14-alstroemeria',       latin: 'Alstroemeria aurea',     es: 'Lirio de los incas',       en: 'Inca lily',             phase: 2, registered: true },
  { file: '15-cosmos',             latin: 'Cosmos bipinnatus',      es: 'Cosmos',                   en: 'Cosmos',                phase: 2, registered: true },
  { file: '16-masdevallia-rosa',   latin: 'Masdevallia sp.',        es: 'Orquídea de los Yungas',   en: 'Yungas orchid',         phase: 2, registered: true },

  // Fase 3 — la IA reinterpreta: arquitecturas nuevas sobre especies reales
  { file: '17-masdevallia-lavanda', latin: 'Masdevallia cf.',       es: 'Orquídea de bosque nublado', en: 'Cloud-forest orchid', phase: 3, registered: true },
  { file: '18-dalia-peonia',       latin: 'Dahlia cf. / Paeonia cf.', es: 'Composición lila',       en: 'Lilac composite',       phase: 3, registered: true },
  { file: '19-camelia-palida',     latin: 'Camellia cf.',           es: 'Camelia pálida',           en: 'Pale camellia',         phase: 3, registered: true },
  { file: '20-peonia-marfil',      latin: 'Paeonia cf.',            es: 'Peonía marfil',            en: 'Ivory peony',           phase: 3, registered: true },

  // Fase 4 — especies inventadas, todavía plausibles
  { file: '21-anemona-veteada',    latin: 'Anemone incerta',        es: 'Anémona veteada',          en: 'Veined anemone',        phase: 4, registered: false },
  { file: '22-anemona-azul',       latin: 'Anemone altiplana',      es: 'Anémona de altura',        en: 'High-altitude anemone', phase: 4, registered: false },
  { file: '23-petunia-lavanda',    latin: 'Petunia liminalis',      es: 'Corola lavanda',           en: 'Lavender corolla',      phase: 4, registered: false },

  // Fase 5 — progresivamente imposibles
  { file: '24-cono-ocre',          latin: 'Conus papyraceus',       es: 'Cono ocre',                en: 'Ochre cone',            phase: 5, registered: false },
  { file: '25-estrella-cactus',    latin: 'Astrocactus volutae',    es: 'Estrella sobre cactus',    en: 'Star on cactus',        phase: 5, registered: false },
  { file: '26-corola-verde',       latin: 'Corolla viridis',        es: 'Corola verde',             en: 'Green corolla',         phase: 5, registered: false },

  // Fase 6 — la flor pierde volumen y vuelve al dibujo; el loop reinicia en la rosa
  { file: '27-estrella-crema',     latin: null,                     es: 'Estrella crema',           en: 'Cream star',            phase: 6, registered: false },
  { file: '28-clematide-papel',    latin: null,                     es: 'Clemátide de papel',       en: 'Paper clematis',        phase: 6, registered: false }
];
