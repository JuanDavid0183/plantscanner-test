// model.js — Plant Scanner MVC: Model-laag
// Alle data, state en business-logica. Geen DOM-toegang, geen events.

// ============================================================
// MODEL — alle data, state en business-logica.
// Geen DOM-toegang, geen event-handlers. Hier zit alles wat
// de applicatie 'weet' over de huidige scan en de gebruiker.
// ============================================================
const Model = {
  // Huidige state van de scan en de applicatie
  state: {
    photoUrl: null,
    plantType: null,
    phase: null,
    lang: 'nl',
    reportId: null,
    potential: null
  },
  selectedGoals: new Set(),

  // localStorage configuratie
  HISTORY_KEY: 'auxine-scan-history',
  MAX_HISTORY: 20,

  // Vertalingen voor NL en EN
  translations: {
  nl: {
    eyebrow: 'Plantscanner · Wetenschappelijk onderbouwd',
    h1: 'Ontdek het <span>onbenutte potentieel</span> van uw planten.',
    lede: 'Onze scanner analyseert uw gewas in een paar stappen en toont waar de natuurlijke kracht van auxine — het oudste plantenhormoon — het verschil maakt voor uw oogst.',
    startBtn: 'Start de scan',
    pill1: '20% meer opbrengst',
    pill2: '5 dagen kortere cyclus',
    pill3: 'Veilig voor bijen',
    pill4: '100% biologisch',
    langToggle: '🌐 EN',
    // Stap 1
    s1_title: 'Upload een <span>foto</span> van uw plant',
    s1_sub: 'Voor de meest nauwkeurige analyse, upload een duidelijke foto van uw gewas.',
    s1_drop_h3: 'Sleep uw foto hierheen',
    s1_drop_p: 'Of klik om een foto te selecteren vanaf uw apparaat',
    s1_drop_btn: 'Foto kiezen',
    s1_drop_formats: 'JPG, PNG, WEBP · max 10 MB',
    s1_preview_tag: 'FOTO GELADEN',
    s1_preview_ready: 'klaar voor analyse',
    s1_continue: 'Verder met scan',
    back: '← Terug',
    // Stap 2
    s2_title: 'Wat voor <span>gewas</span> gaat u scannen?',
    s2_sub: 'Auxine werkt op alle vaatplanten — van kruiden tot productiegewassen. Selecteer de categorie die het best bij uw teelt past.',
    // Stap 3
    s3_title: 'In welke <span>groeifase</span> bevindt uw plant zich?',
    s3_sub: 'Auxine is in elke fase actief. Per fase verandert echter de werking en focus van het hormoon.',
    // Stap 4
    s4_title: 'Wat wilt u vooral <span>verbeteren</span>?',
    s4_sub: 'U kunt <strong>meerdere doelen</strong> tegelijk aanvinken voor een uitgebreid advies. Auxine grijpt op alle vlakken in.',
    s4_count_zero: 'Selecteer minimaal 1 doel',
    s4_count_one: 'doel geselecteerd',
    s4_count_many: 'doelen geselecteerd',
    s4_scan: 'Start de scan',
    // Opties per stap (key = data-val)
    opts: {
      groente:     { l: 'Groente',           d: 'Tomaat, paprika, sla, courgette' },
      fruit:       { l: 'Fruit',             d: 'Aardbei, druif, appel' },
      bessen:      { l: 'Bessen',            d: 'Bramen, frambozen, blauwbes' },
      druiven:     { l: 'Wijnbouw',          d: 'Druiven, wijnranken' },
      bloemen:     { l: 'Bloemen',           d: 'Roos, dahlia, snijbloemen' },
      kruiden:     { l: 'Kruiden',           d: 'Basilicum, munt, peterselie' },
      sier:        { l: 'Sierplanten',       d: 'Kamerplanten, struiken' },
      bomen:       { l: 'Bomen & heesters',  d: 'Hortensia, fruitboom, sierboom' },
      zaaien:      { l: 'Zaaien & kiemen',   d: 'Zaden, kiemplantjes' },
      stekken:     { l: 'Stekken',           d: 'Beworteling fase' },
      vegetatief:  { l: 'Vegetatief',        d: 'Bladgroei, verstreking' },
      bloei:       { l: 'Bloei',             d: 'Bloemvorming' },
      vrucht:      { l: 'Vruchtzetting',     d: 'Vruchtgroei, vorming' },
      rijping:     { l: 'Rijping & oogst',   d: 'Eindfase, smaakontwikkeling' },
      wortels:         { l: 'Sterkere wortels',  d: 'Betere voedingsopname' },
      'bloemen-fruit': { l: 'Meer vruchten',     d: 'Generatieve groei' },
      stress:          { l: 'Stress weerstand', d: 'Droogte, hitte' },
      cyclus:          { l: 'Snellere cyclus',  d: 'Korter teelt' },
      opbrengst:       { l: 'Hogere opbrengst', d: 'Meer kg / m²' },
      blad:            { l: 'Bladkwaliteit',    d: 'Voorkomt bladverlies' },
      smaak:           { l: 'Smaak & suiker',   d: 'Brix, koolhydraten' },
      gezondheid:      { l: 'Plantgezondheid',  d: 'Algemene vitaliteit' }
    },
    // Scan-pagina (stap 5)
    scan_default_status: 'Initialiseren...',
    scan_default_title: 'Plant wordt geanalyseerd',
    scan_phases: [
      { s: 'Initialiseren...',           t: 'Plant wordt gedetecteerd' },
      { s: 'Bladstructuur scannen',      t: 'Bladstructuur analyseren' },
      { s: 'Wortelactiviteit meten',     t: 'Wortelactiviteit meten' },
      { s: 'Hormoon-niveau bepalen',     t: 'IAA-niveau bepalen' },
      { s: 'Groeipotentieel berekenen',  t: 'Groeipotentieel berekenen' },
      { s: 'Rapport samenstellen',       t: 'Rapport genereren' }
    ],
    // Resultaten-hero (stap 6 top)
    r_eyebrow: 'Scan compleet · Rapport #',
    r_h1: 'Uw plant heeft een <span>onbenut potentieel</span>',
    r_intro: 'Op basis van uw scan heeft de Auxine-analyzer een rapport voor uw gewas samengesteld.',
    sc_label: 'Groeipotentieel',
    sc_default_sub: 'Verwachte opbrengstwinst bij wekelijkse Auxine-toediening over één volledige cyclus.',
    sc_combined_sub: 'Gecombineerd potentieel over {n} geselecteerde doelen bij wekelijkse Auxine-toediening.',
    goal_subs: {
      wortels:         'Verwachte toename in wortelmassa en nutriëntenopname.',
      'bloemen-fruit': 'Verwachte opbrengstwinst in bloei en vruchtzetting.',
      stress:          'Verwachte verbetering in droogte- en hittetolerantie.',
      cyclus:          'Verwachte cycluskorting van minimaal 5 dagen.',
      opbrengst:       'Verwachte opbrengstwinst per m² over één cyclus.',
      blad:            'Behoud van bladgroen en preventie van bladverlies.',
      smaak:           'Verwachte verhoging in koolhydraat- en Brix-waarde.',
      gezondheid:      'Versterking van de natuurlijke vitaliteit van uw plant.'
    },
    newScan: '↻ Nieuwe scan starten',
    // Foto-resultaatkaart
    pr_h2: 'Uw plant in <span>detail</span>',
    pr_sub: 'Visuele analyse van de geüploade foto',
    pr_badge1: '✓ Gezond gewas',
    pr_badge2: '⚡ Hoog potentieel',
    pr_h3: 'Plant gedetecteerd & geanalyseerd',
    pr_p: 'De scanner heeft op uw foto drie sleutelzones gemarkeerd waar Auxine direct effect zal hebben.',
    pr_findings: [
      'Bladstructuur — vegetatieve groei kan geactiveerd',
      'Stengelzone — celstrekking kan worden geoptimaliseerd',
      'Wortelhalsgebied — beworteling te versterken'
    ],
    // Persoonlijk advies
    adv_h2: 'Uw <span>persoonlijk advies</span>',
    adv_template: 'Uw <strong>{plant}</strong> bevindt zich in de {phase}. De scanner adviseert om de natuurlijke auxine-concentratie aan te vullen via foliaire toediening — dit versterkt zowel wortelactiviteit als generatieve groei.',
    adv_extra_goals: ' Met {n} geselecteerde doelen krijgt u een gecombineerd voordeel — Auxine pakt deze tegelijk aan.',
    plant_labels: {
      groente: 'groentegewas', fruit: 'fruitteelt', bessen: 'bessenteelt',
      druiven: 'wijnbouw', bloemen: 'bloementeelt', kruiden: 'kruidengewas',
      sier: 'sierplant', bomen: 'boom of heester'
    },
    phase_labels: {
      zaaien: 'zaai- en kiemfase', stekken: 'stekfase',
      vegetatief: 'vegetatieve fase', bloei: 'bloeifase',
      vrucht: 'vruchtzettingsfase', rijping: 'rijpings- en oogstfase'
    },
    adv_default_plant: 'gewas',
    adv_default_phase: 'huidige fase',
    // Benefits
    ben_eyebrow: 'De voordelen',
    ben_h2: 'Wat <span>auxine</span> voor uw plant doet',
    ben_sub: 'Wetenschappelijk onderbouwd · 6 bewezen effecten',
    benefits: [
      { h: 'Sterkere wortelvorming', p: 'Auxine bevordert celdeling en celstrekking in de worteltop. Een dichter wortelstelsel betekent betere opname van water en nutriënten.', sl: 'Beworteling' },
      { h: 'Krachtigere stengel & blad', p: 'Het hormoon stuurt fototropie aan. Sterkere stelen en grotere bladoppervlakte — meer fotosynthese, gezondere plant.', sl: 'Bladmassa' },
      { h: 'Meer bloemen & vruchten', p: 'Auxine reguleert vruchtzetting en remt vroegtijdige vruchtval. Resultaat: zwaardere, mooiere oogst per plant.', sl: 'Opbrengst' },
      { h: 'Koolhydraat\u00advorming', p: 'Op de juiste concentratie verandert auxine fotosynthetische routes. Meer suikers en zetmeel — bouwstoffen voor zwaardere vruchten.', sl: 'Suikergehalte' },
      { h: 'Droogte- & hittebestendig', p: 'Een groter wortelstelsel maakt de plant veerkrachtiger. Recente studies tonen dat planten bij hitte hun auxine-route herprogrammeren.', sl: 'Cyclusduur' },
      { h: 'Het oudste plant\u00adhormoon', p: 'Auxine is meer dan een miljard jaar oud, aanwezig van groene algen tot bloemplanten. Wageningen-onderzoek noemt het "het belangrijkste signaalmolecuul in planten".', sl: 'Jaar evolutie' }
    ],
    // USPs
    usp_eyebrow: 'Waarom auxine?',
    usp_h2: 'De kracht van <span>Auxine.eu</span>',
    usp_sub: '100% biologische plantenvoeding, wetenschappelijk onderbouwd',
    usps: [
      { m: '+ 20%',       h: 'Tot 20% meer opbrengst',        p: 'Wetenschappelijk onderbouwde meeropbrengst op groenten en fruit.' },
      { m: '−5 DAGEN',    h: 'Kortere teeltcyclus',           p: 'Uw gewas bereikt het oogstmoment minimaal 5 dagen sneller.' },
      { m: '100% BIO',    h: 'Volledig biologisch',           p: 'Plantaardig: non-GMO soja, suikerriet, melasse en rijst-vinasses.' },
      { m: '3-IN-1',      h: 'Wortel · vegetatief · generatief', p: 'Eén product werkt op álle drie de groeistadia tegelijk.' },
      { m: 'CONCENTRAAT', h: '50+ behandelingen per fles',    p: 'Slechts 10 ml per liter water — de 250 ml fles gaat lang mee.' },
      { m: 'VEILIG',      h: 'Veilig voor bijen',             p: 'Geen schadelijke chemicaliën — perfect voor uw moestuin én bestuivers.' }
    ],
    // Productkaart
    prod_eyebrow: '★ Aanbevolen voor u',
    prod_h2: 'Ons <span>vlagschip\u00adproduct</span>',
    prod_sub: 'Op basis van uw scan adviseren wij Auxine 250ml',
    prod_badge: '★ BESTSELLER',
    prod_bestseller: '★ N°1 Biologische plantenvoeding',
    prod_reviews: '4.9 / 5 — 142 reviews',
    prod_desc: 'Hoog geconcentreerd biologisch plantenhormoon. Meer dan 50 behandelingen per fles. Bewezen <strong>20% meer opbrengst</strong> en meetbaar gezondere planten.',
    prod_checks: ['20% meer opbrengst', 'Veilig voor bijen', 'Stimuleert wortelvorming', 'Voorkomt bladverlies'],
    prod_stock: 'Op voorraad — vandaag besteld, morgen in huis',
    prod_cta: 'In winkelmand',
    prod_cta2: 'Meer informatie',
    prod_trust: ['⚡ Snelle levering', '↩ 14 dagen retour', '🔒 Veilig betalen'],
    // Application
    app_eyebrow: 'Eenvoudig in gebruik',
    app_h2: 'Zo gebruikt u <span>Auxine</span>',
    app_sub: 'In 4 simpele stappen op weg naar 20% meer opbrengst',
    app_steps: [
      { h: 'Verdun',          p: 'Meng 10 ml Auxine met 1 liter water in uw drukspuit.' },
      { h: 'Bespuit',         p: 'Spuit het hele gewas — boven- én onderkant van het blad — eenmaal per week.' },
      { h: 'Intensieve fase', p: 'In week 2, 3 en 4 van de bloei werkt 10 ml per liter het beste.' },
      { h: 'Oogsten',         p: 'Verwacht 5 dagen kortere cyclus en tot 20% meer opbrengst.' }
    ],
    // Sources
    src_eyebrow: 'Wetenschappelijk onderbouwd',
    src_h2: 'Onafhankelijke <span>bronnen</span>',
    src_sub: 'Wikipedia · Universiteits­studies · Peer-reviewed publicaties',
    sources: [
      { h: 'Auxin — Encyclopedie artikel', s: 'Wikipedia', m: ' · Het Nederlandse onderzoek dat auxine in de jaren \'20 ontdekte (Frits Warmolt Went) en de isolatie van indool-3-azijnzuur (IAA) door Kenneth V. Thimann.' },
      { h: 'Transcriptional Responses to the Auxin Hormone', s: 'Wageningen University & Research', m: ' · Weijers, D. & Wagner, D. (2016). <em>Annual Review of Plant Biology</em>, 67, 539–574.' },
      { h: 'Auxin — Latest research', s: 'Nature', m: ' · Auxine als één van de vijf hoofd-plantenhormonen, met centrale rol in bloei, vruchtrijping en stressrespons.' },
      { h: 'Auxin Interactions with Other Hormones', s: 'NCBI / PMC', m: ' · Auxine als crux in plantenontwikkeling, van embryogenese tot orgaanseneszentie.' },
      { h: 'Advances in Plant Auxin Biology', s: 'Plants Journal · NCBI', m: ' · IAA-synthese en metabolisme, polair transport en signaaltransductie.' },
      { h: 'Naturally Occurring Plant Hormones', s: 'Utah State University', m: ' · Toepassing in commerciële fruitteelt; auxinen worden geproduceerd in apicale knoppen.' },
      { h: 'Auxin — Overview', s: 'ScienceDirect / Elsevier', m: ' · Indool-gebaseerde plantenhormonen uit tryptofaan: regulatie van celdeling en differentiatie.' },
      { h: 'Auxine.eu — Studie\'s', s: 'auxine.eu', m: ' · Onafhankelijke artikelen over plantenhormonen, geactualiseerde productinformatie en recente studies.' }
    ],
    // Geschiedenis
    hist_btn: '📋 Geschiedenis',
    hist_title: 'Uw <span>scangeschiedenis</span>',
    hist_sub: 'Bekijk uw vorige scans en open het rapport opnieuw',
    hist_empty: 'Nog geen scans uitgevoerd. Start uw eerste scan!',
    hist_clear: 'Geschiedenis wissen',
    hist_clear_confirm: 'Weet u zeker dat u uw scangeschiedenis wilt wissen?',
    hist_potential_label: 'potentieel'
  },
  en: {
    eyebrow: 'Plant Scanner · Scientifically Proven',
    h1: 'Discover the <span>untapped potential</span> of your plants.',
    lede: 'Our scanner analyzes your crop in a few steps and shows where the natural power of auxin — the oldest plant hormone — makes the difference for your harvest.',
    startBtn: 'Start the scan',
    pill1: '20% more yield',
    pill2: '5 days shorter cycle',
    pill3: 'Safe for bees',
    pill4: '100% organic',
    langToggle: '🌐 NL',
    // Step 1
    s1_title: 'Upload a <span>photo</span> of your plant',
    s1_sub: 'For the most accurate analysis, upload a clear photo of your crop.',
    s1_drop_h3: 'Drop your photo here',
    s1_drop_p: 'Or click to select a photo from your device',
    s1_drop_btn: 'Choose photo',
    s1_drop_formats: 'JPG, PNG, WEBP · max 10 MB',
    s1_preview_tag: 'PHOTO LOADED',
    s1_preview_ready: 'ready for analysis',
    s1_continue: 'Continue to scan',
    back: '← Back',
    // Step 2
    s2_title: 'What type of <span>crop</span> are you scanning?',
    s2_sub: 'Auxin works on all vascular plants — from herbs to production crops. Select the category that best fits your cultivation.',
    // Step 3
    s3_title: 'In which <span>growth phase</span> is your plant?',
    s3_sub: 'Auxin is active in every phase. However, its function and focus change per phase.',
    // Step 4
    s4_title: 'What do you mainly want to <span>improve</span>?',
    s4_sub: 'You can select <strong>multiple goals</strong> at once for a comprehensive advice. Auxin works on all aspects.',
    s4_count_zero: 'Select at least 1 goal',
    s4_count_one: 'goal selected',
    s4_count_many: 'goals selected',
    s4_scan: 'Start the scan',
    opts: {
      groente:     { l: 'Vegetables',        d: 'Tomato, pepper, lettuce, zucchini' },
      fruit:       { l: 'Fruit',             d: 'Strawberry, grape, apple' },
      bessen:      { l: 'Berries',           d: 'Blackberry, raspberry, blueberry' },
      druiven:     { l: 'Viticulture',       d: 'Grapes, vines' },
      bloemen:     { l: 'Flowers',           d: 'Rose, dahlia, cut flowers' },
      kruiden:     { l: 'Herbs',             d: 'Basil, mint, parsley' },
      sier:        { l: 'Ornamentals',       d: 'Houseplants, shrubs' },
      bomen:       { l: 'Trees & shrubs',    d: 'Hydrangea, fruit tree, ornamental tree' },
      zaaien:      { l: 'Sowing & germination', d: 'Seeds, seedlings' },
      stekken:     { l: 'Cuttings',          d: 'Rooting phase' },
      vegetatief:  { l: 'Vegetative',        d: 'Leaf growth, structure' },
      bloei:       { l: 'Flowering',         d: 'Flower formation' },
      vrucht:      { l: 'Fruit-setting',     d: 'Fruit growth, formation' },
      rijping:     { l: 'Ripening & harvest', d: 'Final phase, flavor development' },
      wortels:         { l: 'Stronger roots',  d: 'Better nutrient uptake' },
      'bloemen-fruit': { l: 'More fruits',     d: 'Generative growth' },
      stress:          { l: 'Stress resistance', d: 'Drought, heat' },
      cyclus:          { l: 'Faster cycle',    d: 'Shorter cultivation' },
      opbrengst:       { l: 'Higher yield',    d: 'More kg / m²' },
      blad:            { l: 'Leaf quality',    d: 'Prevents leaf loss' },
      smaak:           { l: 'Taste & sugar',   d: 'Brix, carbohydrates' },
      gezondheid:      { l: 'Plant health',    d: 'Overall vitality' }
    },
    scan_default_status: 'Initializing...',
    scan_default_title: 'Analyzing plant',
    scan_phases: [
      { s: 'Initializing...',           t: 'Detecting plant' },
      { s: 'Scanning leaf structure',   t: 'Analyzing leaf structure' },
      { s: 'Measuring root activity',   t: 'Measuring root activity' },
      { s: 'Determining hormone level', t: 'Determining IAA level' },
      { s: 'Calculating growth potential', t: 'Calculating growth potential' },
      { s: 'Compiling report',          t: 'Generating report' }
    ],
    r_eyebrow: 'Scan complete · Report #',
    r_h1: 'Your plant has an <span>untapped potential</span>',
    r_intro: 'Based on your scan, the Auxine analyzer has compiled a report for your crop.',
    sc_label: 'Growth potential',
    sc_default_sub: 'Expected yield gain with weekly Auxine treatment over one full cycle.',
    sc_combined_sub: 'Combined potential over {n} selected goals with weekly Auxine treatment.',
    goal_subs: {
      wortels:         'Expected increase in root mass and nutrient uptake.',
      'bloemen-fruit': 'Expected yield gain in flowering and fruit-setting.',
      stress:          'Expected improvement in drought and heat tolerance.',
      cyclus:          'Expected cycle reduction of at least 5 days.',
      opbrengst:       'Expected yield gain per m² over one cycle.',
      blad:            'Preservation of chlorophyll and prevention of leaf loss.',
      smaak:           'Expected increase in carbohydrate and Brix value.',
      gezondheid:      'Strengthening the natural vitality of your plant.'
    },
    newScan: '↻ Start new scan',
    pr_h2: 'Your plant in <span>detail</span>',
    pr_sub: 'Visual analysis of the uploaded photo',
    pr_badge1: '✓ Healthy crop',
    pr_badge2: '⚡ High potential',
    pr_h3: 'Plant detected & analyzed',
    pr_p: 'The scanner has marked three key zones on your photo where Auxine will have direct effect.',
    pr_findings: [
      'Leaf structure — vegetative growth can be activated',
      'Stem zone — cell elongation can be optimized',
      'Root collar area — rooting to be strengthened'
    ],
    adv_h2: 'Your <span>personal advice</span>',
    adv_template: 'Your <strong>{plant}</strong> is in the {phase}. The scanner advises supplementing the natural auxin concentration via foliar application — this strengthens both root activity and generative growth.',
    adv_extra_goals: ' With {n} selected goals you get a combined benefit — Auxine addresses these simultaneously.',
    plant_labels: {
      groente: 'vegetable crop', fruit: 'fruit cultivation', bessen: 'berry cultivation',
      druiven: 'viticulture', bloemen: 'flower cultivation', kruiden: 'herb crop',
      sier: 'ornamental plant', bomen: 'tree or shrub'
    },
    phase_labels: {
      zaaien: 'sowing and germination phase', stekken: 'cutting phase',
      vegetatief: 'vegetative phase', bloei: 'flowering phase',
      vrucht: 'fruit-setting phase', rijping: 'ripening and harvest phase'
    },
    adv_default_plant: 'crop',
    adv_default_phase: 'current phase',
    ben_eyebrow: 'The benefits',
    ben_h2: 'What <span>auxin</span> does for your plant',
    ben_sub: 'Scientifically proven · 6 demonstrated effects',
    benefits: [
      { h: 'Stronger root formation', p: 'Auxin promotes cell division and elongation in the root tip. A denser root system means better uptake of water and nutrients.', sl: 'Rooting' },
      { h: 'Stronger stem & leaves', p: 'The hormone drives phototropism. Stronger stems and larger leaf surface — more photosynthesis, healthier plant.', sl: 'Leaf mass' },
      { h: 'More flowers & fruits', p: 'Auxin regulates fruit-setting and prevents premature fruit drop. Result: heavier, more beautiful harvest per plant.', sl: 'Yield' },
      { h: 'Carbohydrate formation', p: 'At the right concentration, auxin alters photosynthetic routes. More sugars and starches — building blocks for heavier fruits.', sl: 'Sugar content' },
      { h: 'Drought & heat resistant', p: 'A larger root system makes the plant more resilient. Recent studies show plants reprogram their auxin pathway under heat stress.', sl: 'Cycle duration' },
      { h: 'The oldest plant hormone', p: 'Auxin is over a billion years old, present from green algae to flowering plants. Wageningen research calls it "the most important signaling molecule in plants".', sl: 'Years of evolution' }
    ],
    usp_eyebrow: 'Why auxin?',
    usp_h2: 'The power of <span>Auxine.eu</span>',
    usp_sub: '100% organic plant nutrition, scientifically proven',
    usps: [
      { m: '+ 20%',       h: 'Up to 20% more yield',           p: 'Scientifically proven yield gain on vegetables and fruit.' },
      { m: '−5 DAYS',     h: 'Shorter cultivation cycle',      p: 'Your crop reaches harvest at least 5 days sooner.' },
      { m: '100% BIO',    h: 'Fully organic',                  p: 'Plant-based: non-GMO soy, sugar cane, molasses and rice vinasses.' },
      { m: '3-IN-1',      h: 'Root · vegetative · generative', p: 'One product works on all three growth stages at once.' },
      { m: 'CONCENTRATE', h: '50+ treatments per bottle',      p: 'Just 10 ml per liter of water — the 250 ml bottle lasts long.' },
      { m: 'SAFE',        h: 'Safe for bees',                  p: 'No harmful chemicals — perfect for your vegetable garden and pollinators.' }
    ],
    prod_eyebrow: '★ Recommended for you',
    prod_h2: 'Our <span>flagship product</span>',
    prod_sub: 'Based on your scan we recommend Auxine 250ml',
    prod_badge: '★ BESTSELLER',
    prod_bestseller: '★ N°1 Organic plant nutrition',
    prod_reviews: '4.9 / 5 — 142 reviews',
    prod_desc: 'Highly concentrated organic plant hormone. Over 50 treatments per bottle. Proven <strong>20% more yield</strong> and measurably healthier plants.',
    prod_checks: ['20% more yield', 'Safe for bees', 'Stimulates root formation', 'Prevents leaf loss'],
    prod_stock: 'In stock — order today, delivered tomorrow',
    prod_cta: 'Add to cart',
    prod_cta2: 'More information',
    prod_trust: ['⚡ Fast delivery', '↩ 14 days return', '🔒 Secure payment'],
    app_eyebrow: 'Easy to use',
    app_h2: 'How to use <span>Auxine</span>',
    app_sub: 'In 4 simple steps towards 20% more yield',
    app_steps: [
      { h: 'Dilute',        p: 'Mix 10 ml of Auxine with 1 liter of water in your pressure sprayer.' },
      { h: 'Spray',         p: 'Spray the entire crop — top and bottom of the leaves — once per week.' },
      { h: 'Intensive phase', p: 'In weeks 2, 3 and 4 of flowering, 10 ml per liter works best.' },
      { h: 'Harvest',       p: 'Expect a 5-day shorter cycle and up to 20% more yield.' }
    ],
    src_eyebrow: 'Scientifically proven',
    src_h2: 'Independent <span>sources</span>',
    src_sub: 'Wikipedia · University studies · Peer-reviewed publications',
    sources: [
      { h: 'Auxin — Encyclopedia article', s: 'Wikipedia', m: ' · The Dutch research that discovered auxin in the 1920s (Frits Warmolt Went) and the isolation of indole-3-acetic acid (IAA) by Kenneth V. Thimann.' },
      { h: 'Transcriptional Responses to the Auxin Hormone', s: 'Wageningen University & Research', m: ' · Weijers, D. & Wagner, D. (2016). <em>Annual Review of Plant Biology</em>, 67, 539–574.' },
      { h: 'Auxin — Latest research', s: 'Nature', m: ' · Auxin as one of the five main plant hormones, with central role in flowering, fruit ripening and stress response.' },
      { h: 'Auxin Interactions with Other Hormones', s: 'NCBI / PMC', m: ' · Auxin as crux in plant development, from embryogenesis to organ senescence.' },
      { h: 'Advances in Plant Auxin Biology', s: 'Plants Journal · NCBI', m: ' · IAA synthesis and metabolism, polar transport and signal transduction.' },
      { h: 'Naturally Occurring Plant Hormones', s: 'Utah State University', m: ' · Application in commercial fruit cultivation; auxins are produced in apical buds.' },
      { h: 'Auxin — Overview', s: 'ScienceDirect / Elsevier', m: ' · Indole-based plant hormones from tryptophan: regulation of cell division and differentiation.' },
      { h: 'Auxine.eu — Studies', s: 'auxine.eu', m: ' · Independent articles on plant hormones, updated product information and recent studies.' }
    ],
    hist_btn: '📋 History',
    hist_title: 'Your <span>scan history</span>',
    hist_sub: 'View your previous scans and reopen the report',
    hist_empty: 'No scans yet. Start your first scan!',
    hist_clear: 'Clear history',
    hist_clear_confirm: 'Are you sure you want to clear your scan history?',
    hist_potential_label: 'potential'
  }
},

  // --- Getters ---
  getT()           { return this.translations[this.state.lang]; },
  getSelectedGoals() { return Array.from(this.selectedGoals); },
  goalCount()      { return this.selectedGoals.size; },

  // --- Setters / mutations ---
  setPhotoUrl(url) { this.state.photoUrl = url; },
  setPlantType(v) { this.state.plantType = v; },
  setPhase(v)     { this.state.phase = v; },
  toggleGoal(v) {
    if (this.selectedGoals.has(v)) { this.selectedGoals.delete(v); return false; }
    this.selectedGoals.add(v); return true;
  },
  clearGoals() { this.selectedGoals.clear(); },
  setGoals(arr) {
    this.selectedGoals.clear();
    (arr || []).forEach(g => this.selectedGoals.add(g));
  },
  toggleLang() {
    this.state.lang = this.state.lang === 'nl' ? 'en' : 'nl';
    return this.state.lang;
  },

  // --- Business logica ---
  generateReportId() {
    const id = 'A' + Math.floor(10 + Math.random() * 89) + '-' + (new Date().getFullYear());
    this.state.reportId = id;
    return id;
  },

  calculatePotential() {
    const scores = {
      wortels: 22, 'bloemen-fruit': 20, stress: 17, cyclus: 15,
      opbrengst: 20, blad: 18, smaak: 16, gezondheid: 19
    };
    const goals = this.getSelectedGoals();
    const nums = goals.map(g => scores[g]).filter(Boolean);
    const maxNum = nums.length ? Math.max(...nums) : 20;
    const bonus = Math.min(Math.max(goals.length - 1, 0), 3);
    this.state.potential = maxNum + bonus;
    return this.state.potential;
  },

  generateDiagnosisText() {
    const t = this.getT();
    const plantLabel = t.plant_labels[this.state.plantType] || t.adv_default_plant;
    const phaseLabel = t.phase_labels[this.state.phase] || t.adv_default_phase;
    const n = this.goalCount();
    let txt = t.adv_template.replace('{plant}', plantLabel).replace('{phase}', phaseLabel);
    if (n > 1) txt += t.adv_extra_goals.replace('{n}', n);
    return txt;
  },

  generateScorecardSub() {
    const t = this.getT();
    const goals = this.getSelectedGoals();
    if (goals.length === 1 && t.goal_subs[goals[0]]) return t.goal_subs[goals[0]];
    if (goals.length > 1) return t.sc_combined_sub.replace('{n}', goals.length);
    return t.sc_default_sub;
  },

  isValidEmail(addr) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((addr || '').trim());
  },

  // --- E-mail body opbouwen voor mailto-link ---
  buildEmailBody(userMsg) {
    const t = this.getT();
    const plantLabel = t.plant_labels[this.state.plantType] || t.adv_default_plant;
    const phaseLabel = t.phase_labels[this.state.phase] || t.adv_default_phase;
    const goals = this.getSelectedGoals().map(g => t.opts[g] ? t.opts[g].l : g).join(', ') || '—';
    const diagnosis = this.generateDiagnosisText().replace(/<[^>]+>/g, '');
    const extra = userMsg && userMsg.trim() ? '\n\n' + userMsg.trim() : '';
    return [
      'Auxine Plant Scanner — Rapport',
      '================================',
      '',
      'Rapport-ID: ' + (this.state.reportId || '-'),
      'Gewas: ' + plantLabel,
      'Groeifase: ' + phaseLabel,
      'Doelen: ' + goals,
      'Groeipotentieel: +' + (this.state.potential || 0) + '%',
      '',
      '--- Persoonlijk advies ---',
      diagnosis,
      extra,
      '',
      'Meer info: https://auxine.eu',
      'Bekijk volledige scanner: https://auxine.eu/plantscan'
    ].join('\n');
  },

  // --- localStorage scan-geschiedenis ---
  loadHistory() {
    try {
      const raw = localStorage.getItem(this.HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  },
  saveToHistory(scan) {
    try {
      const list = this.loadHistory();
      list.unshift(scan);
      const trimmed = list.slice(0, this.MAX_HISTORY);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmed));
    } catch (e) { console.warn('Kon scan niet opslaan:', e); }
  },
  clearHistory() {
    try { localStorage.removeItem(this.HISTORY_KEY); } catch (e) {}
  },
  findScan(id) { return this.loadHistory().find(s => s.id === id); },

  // Sla de huidige scan op vanuit de state
  saveCurrentScan() {
    this.saveToHistory({
      id: this.state.reportId,
      date: new Date().toISOString(),
      photoUrl: this.state.photoUrl,
      plantType: this.state.plantType,
      phase: this.state.phase,
      goals: this.getSelectedGoals(),
      potential: this.state.potential
    });
  },

  // Laad een opgeslagen scan terug in de state
  restoreScan(scan) {
    this.state.photoUrl = scan.photoUrl;
    this.state.plantType = scan.plantType;
    this.state.phase = scan.phase;
    this.state.reportId = scan.id;
    this.state.potential = scan.potential;
    this.setGoals(scan.goals);
  }
};
