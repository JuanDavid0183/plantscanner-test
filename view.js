// view.js — Plant Scanner MVC: View-laag
// Alle DOM-rendering en -updating. Geen state, geen events.
// Leest van Model (waar nodig) en schrijft naar de DOM.
//
// De View is verantwoordelijk voor wat de gebruiker ZIET. Hij verandert
// nooit zelf de data (dat doet het Model) en luistert niet naar klikken
// (dat doet de Controller). Hij krijgt opdracht "toon dit" en regelt dan
// de juiste aanpassingen in de HTML/DOM.

const View = {

  // --- Navigatie ---
  // Toont de gevraagde stap van de wizard en verbergt alle andere.
  navigateTo(stepNum) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active')); // verberg alle stappen door overal 'active' weg te halen
    const step = document.getElementById('step-' + stepNum);                       // zoek de gevraagde stap op (bv. 'step-3')
    if (step) step.classList.add('active');                                         // maak alleen die ene stap zichtbaar
    window.scrollTo({ top: 0, behavior: 'smooth' });                               // scroll soepel terug naar boven
  },

  // --- Taal/Tekst toepassen op de hele UI (groot, daarom losse functie) ---
  // Zet ALLE teksten op het scherm in de juiste taal. Het patroon is overal
  // hetzelfde: element ophalen, checken of het bestaat (de 'if'), tekst vervangen.
  applyLang() {
    const t = Model.getT();   // 't' = het vertaalobject voor de actieve taal (nl of en)

    // --- Stap 0: de landingspagina ---
    const step0 = document.getElementById('step-0');                    // de landingspagina ophalen
    if (step0) {                                                        // alleen doorgaan als die bestaat
      const eyebrow = step0.querySelector('.eyebrow');                 // het kleine kopje boven de titel
      const h1 = step0.querySelector('h1');                            // de hoofdtitel
      const lede = step0.querySelector('.lede');                       // de intro-paragraaf
      const startBtn = step0.querySelector('.btn[data-goto="1"]');     // de "Start de scan"-knop
      const pills = step0.querySelectorAll('.feature-pills .pill');    // de feature-balkjes onder de knop
      if (eyebrow) eyebrow.textContent = t.eyebrow;                    // kopje vertalen
      if (h1) h1.innerHTML = t.h1;                                     // titel vertalen (innerHTML want er zit een <span> in)
      if (lede) lede.textContent = t.lede;                            // intro vertalen
      if (startBtn) {                                                  // de startknop opnieuw opbouwen met pijltje
        let arrow = startBtn.querySelector('.btn-arrow');             // bestaand pijltje zoeken
        startBtn.textContent = t.startBtn + ' ';                      // knoptekst vertalen
        if (!arrow) { arrow = document.createElement('span'); arrow.className = 'btn-arrow'; arrow.textContent = '→'; } // geen pijltje? maak er een
        startBtn.appendChild(arrow);                                  // pijltje achter de tekst plakken
      }
      if (pills[0]) pills[0].innerHTML = '<span class="check">✓</span> ' + t.pill1; // 1e feature-balk met vinkje
      if (pills[1]) pills[1].innerHTML = '<span class="check">✓</span> ' + t.pill2; // 2e feature-balk
      if (pills[2]) pills[2].innerHTML = '<span class="check">✓</span> ' + t.pill3; // 3e feature-balk
      if (pills[3]) pills[3].innerHTML = '<span class="check">✓</span> ' + t.pill4; // 4e feature-balk
    }

    // --- Stap 1: de foto-upload pagina ---
    const step1 = document.getElementById('step-1');                   // de upload-pagina ophalen
    if (step1) {
      const title = step1.querySelector('.step-title');               // titel van stap 1
      const sub = step1.querySelector('.step-sub');                   // ondertitel
      const dropH3 = step1.querySelector('.dropzone h3');             // tekst in de sleep-zone
      const dropP = step1.querySelector('.dropzone > p');             // uitleg onder de sleep-zone-titel
      const dropBtn = step1.querySelector('#chooseBtn');              // de "Foto kiezen"-knop
      const dropFmt = step1.querySelector('.dropzone-formats');       // tekst met toegestane formaten
      const previewTag = step1.querySelector('.img-tag');             // label op de foto-preview
      const continueBtn = step1.querySelector('#continueBtn');        // "Verder met scan"-knop
      const backBtn = step1.querySelector('.back-btn');               // terug-knop
      if (title) title.innerHTML = t.s1_title;                        // titel vertalen
      if (sub) sub.textContent = t.s1_sub;                            // ondertitel vertalen
      if (dropH3) dropH3.textContent = t.s1_drop_h3;                  // sleep-zone titel vertalen
      if (dropP) dropP.textContent = t.s1_drop_p;                     // sleep-zone uitleg vertalen
      if (dropBtn) {                                                  // kiesknop opnieuw opbouwen met icoon
        const svg = dropBtn.querySelector('svg');                     // het icoontje in de knop
        dropBtn.textContent = ' ' + t.s1_drop_btn;                    // knoptekst vertalen
        if (svg) dropBtn.insertBefore(svg, dropBtn.firstChild);       // icoon weer vooraan zetten
      }
      if (dropFmt) dropFmt.textContent = t.s1_drop_formats;           // formaten-tekst vertalen
      if (previewTag) previewTag.textContent = t.s1_preview_tag;      // preview-label vertalen
      if (continueBtn) {                                              // verder-knop opnieuw opbouwen
        let arrow = continueBtn.querySelector('.btn-arrow');          // bestaand pijltje zoeken
        continueBtn.innerHTML = '<span id="continueBtnText">' + t.s1_continue + '</span>'; // tekst in een span zetten
        const sp = document.createElement('span');                    // nieuw pijltje-element maken
        sp.className = 'btn-arrow';                                    // juiste stijl-klasse geven
        sp.id = 'continueBtnArrow';                                   // id voor latere referentie
        sp.textContent = '→';                                         // het pijltje-teken
        continueBtn.appendChild(sp);                                  // pijltje achter de tekst plakken
      }
      if (backBtn) backBtn.textContent = t.back;                      // terug-knop vertalen
    }

    // --- Stappen 2, 3, 4: zelfde stramien (titel + sub + terug-knop) ---
    // In plaats van 3x apart loopen we over de drie stappen heen.
    [['step-2', 's2_title', 's2_sub'],
    ['step-3', 's3_title', 's3_sub'],
    ['step-4', 's4_title', 's4_sub']].forEach(([id, titleKey, subKey]) => {
      const step = document.getElementById(id);                       // de stap-container ophalen
      if (!step) return;                                              // bestaat niet? overslaan
      const title = step.querySelector('.step-title');               // titel-element
      const sub = step.querySelector('.step-sub');                   // ondertitel-element
      const backBtn = step.querySelector('.back-btn');               // terug-knop
      if (title) title.innerHTML = t[titleKey];                      // titel vertalen (key verschilt per stap)
      if (sub) sub.innerHTML = t[subKey];                            // ondertitel vertalen
      if (backBtn) backBtn.textContent = t.back;                     // terug-knop vertalen
    });

    // --- De keuze-tegels op stap 2, 3, 4 ---
    // Elke tegel heeft een data-val (bv. 'groente'); daarmee zoeken we het
    // juiste vertaalde label + omschrijving op en zetten die in de tegel.
    document.querySelectorAll('#opts-2 .option, #opts-3 .option, #opts-4 .option').forEach(opt => {
      const val = opt.getAttribute('data-val');                       // de code van deze tegel (bv. 'groente')
      const entry = t.opts[val];                                      // bijbehorende vertaling opzoeken
      if (!entry) return;                                             // geen vertaling? tegel overslaan
      const labelEl = opt.querySelector('.label');                   // het label-element van de tegel
      const descEl = opt.querySelector('.desc');                     // het omschrijving-element
      if (labelEl) labelEl.textContent = entry.l;                    // label vertalen
      if (descEl) descEl.textContent = entry.d;                      // omschrijving vertalen
    });

    // --- De teller "X doelen geselecteerd" + de scan-knop op stap 4 ---
    if (typeof updateMultiCount === 'function') updateMultiCount();    // teller bijwerken als die functie bestaat
    const scanBtn = document.getElementById('scanStartBtn');          // de "Start de scan"-knop op stap 4
    if (scanBtn) {                                                    // knop opnieuw opbouwen met pijltje
      let arrow = scanBtn.querySelector('.btn-arrow');                // bestaand pijltje zoeken
      scanBtn.textContent = t.s4_scan + ' ';                          // knoptekst vertalen
      if (!arrow) { arrow = document.createElement('span'); arrow.className = 'btn-arrow'; arrow.textContent = '→'; } // pijltje maken indien nodig
      scanBtn.appendChild(arrow);                                     // pijltje achter de tekst plakken
    }

    // --- Stap 5: de scan-pagina (alleen begintekst; animatie vult de rest) ---
    const scanStatus = document.getElementById('scanStatus');         // status-regel onder de animatie
    const scanTitle = document.getElementById('scanTitle');           // titel boven de animatie
    if (scanStatus) scanStatus.innerHTML = '<span class="dot"></span> ' + t.scan_default_status; // begin-status met stip
    if (scanTitle) scanTitle.textContent = t.scan_default_title;      // begin-titel vertalen

    // --- Stap 6: de resultatenpagina (grootste pagina, veel secties) ---
    const step6 = document.getElementById('step-6');                  // de resultatenpagina ophalen
    if (step6) {
      const eyebrowLight = step6.querySelector('.eyebrow-light');     // kopje "Scan compleet · Rapport #"
      const heroH1 = step6.querySelector('.result-hero h1');          // grote titel bovenaan resultaat
      const heroP = step6.querySelector('.result-hero > div > p');    // intro-tekst onder de titel
      const scLabel = step6.querySelector('.scorecard .label');       // label op de scorekaart
      const newScanBtn = step6.querySelector('.nav-row .back-btn[data-goto="0"]'); // "Nieuwe scan"-knop
      const reportIdEl = document.getElementById('reportId');         // het rapportnummer-element
      const reportIdValue = reportIdEl ? reportIdEl.textContent : ''; // huidig rapportnummer bewaren
      if (eyebrowLight) {                                             // kopje opnieuw opbouwen met rapportnummer erin
        eyebrowLight.innerHTML = t.r_eyebrow + '<span id="reportId">' + reportIdValue + '</span>';
      }
      if (heroH1) heroH1.innerHTML = t.r_h1;                          // hoofdtitel vertalen
      if (heroP) heroP.textContent = t.r_intro;                       // intro vertalen
      if (scLabel) scLabel.textContent = t.sc_label;                  // scorekaart-label vertalen
      if (newScanBtn) newScanBtn.textContent = t.newScan;             // nieuwe-scan-knop vertalen

      // Foto-resultaatkaart: teksten boven de geanalyseerde foto.
      const prHead = document.querySelector('#photoResult .section-head'); // kop-blok van de fotokaart
      if (prHead) {
        const h2 = prHead.querySelector('h2');                        // titel van de fotokaart
        const sub = prHead.querySelector('.sub');                     // ondertitel
        if (h2) h2.innerHTML = t.pr_h2;                               // titel vertalen
        if (sub) sub.textContent = t.pr_sub;                          // ondertitel vertalen
      }
      const badges = document.querySelectorAll('#photoResult .mini-badge'); // de kleine badges op de foto
      if (badges[0]) badges[0].textContent = t.pr_badge1;             // 1e badge ("gezond gewas")
      if (badges[1]) badges[1].textContent = t.pr_badge2;             // 2e badge ("hoog potentieel")
      const prH3 = document.querySelector('#photoResult .photo-result-info h3'); // kopje naast de foto
      const prP = document.querySelector('#photoResult .photo-result-info > p'); // tekst naast de foto
      if (prH3) prH3.textContent = t.pr_h3;                           // kopje vertalen
      if (prP) prP.textContent = t.pr_p;                              // tekst vertalen
      const findings = document.querySelectorAll('#photoResult .finding'); // de 3 "bevindingen" onder de foto
      findings.forEach((f, i) => {                                    // elke bevinding langslopen
        if (t.pr_findings[i]) {                                       // is er een vertaling voor deze?
          f.innerHTML = '<span class="check-mini">' + (i + 1) + '</span> ' + t.pr_findings[i]; // genummerd vinkje + tekst
        }
      });

      // Persoonlijk advies: titel staat vast, de tekst is per scan anders.
      const advTitleEl = document.getElementById('diagnosisTitle');   // titel van het advies-blok
      if (advTitleEl) advTitleEl.innerHTML = t.adv_h2;                // titel vertalen
      const diagEl = document.getElementById('diagnosisText');        // het advies-tekstveld
      if (diagEl && Model.state.plantType) updateDiagnosisText();     // tekst alleen vernieuwen als er al een scan is

      // Benefits-sectie: de 6 voordeel-kaarten.
      const benHead = step6.querySelector('.benefits-section .section-head'); // kop-blok van de sectie
      if (benHead) {
        const eb = benHead.querySelector('.eyebrow');                 // klein kopje
        const h2 = benHead.querySelector('h2');                       // sectietitel
        const sub = benHead.querySelector('.sub');                    // ondertitel
        if (eb) eb.textContent = t.ben_eyebrow;                       // kopje vertalen
        if (h2) h2.innerHTML = t.ben_h2;                              // titel vertalen
        if (sub) sub.textContent = t.ben_sub;                         // ondertitel vertalen
      }
      const benefitCards = step6.querySelectorAll('.benefits .benefit'); // alle voordeel-kaarten
      benefitCards.forEach((card, i) => {                             // elke kaart langslopen
        const b = t.benefits[i];                                      // bijbehorende vertaling
        if (!b) return;                                               // geen vertaling? overslaan
        const h3 = card.querySelector('h3');                          // kaarttitel
        const p = card.querySelector('p');                            // kaarttekst
        const sl = card.querySelector('.stat-label');                 // statistiek-label
        if (h3) h3.textContent = b.h;                                 // titel vertalen
        if (p) p.textContent = b.p;                                   // tekst vertalen
        if (sl) sl.textContent = b.sl;                                // label vertalen
      });

      // USP-sectie: de verkoopargumenten (bv. "20% meer opbrengst").
      const uspHead = step6.querySelector('.usps-section .section-head'); // kop-blok van de sectie
      if (uspHead) {
        const eb = uspHead.querySelector('.eyebrow');                 // klein kopje
        const h2 = uspHead.querySelector('h2');                       // sectietitel
        const sub = uspHead.querySelector('.sub');                    // ondertitel
        if (eb) eb.textContent = t.usp_eyebrow;                       // kopje vertalen
        if (h2) h2.innerHTML = t.usp_h2;                              // titel vertalen
        if (sub) sub.textContent = t.usp_sub;                         // ondertitel vertalen
      }
      const uspItems = step6.querySelectorAll('.usp-list .usp-item'); // alle USP-items
      uspItems.forEach((item, i) => {                                 // elk item langslopen
        const u = t.usps[i];                                          // bijbehorende vertaling
        if (!u) return;                                               // geen vertaling? overslaan
        const marker = item.querySelector('.marker');                 // het cijfer/markering (bv. "+20%")
        const h4 = item.querySelector('h4');                          // item-titel
        const p = item.querySelector('p');                            // item-tekst
        if (marker) marker.textContent = u.m;                         // markering vertalen
        if (h4) h4.textContent = u.h;                                 // titel vertalen
        if (p) p.textContent = u.p;                                   // tekst vertalen
      });

      // Productkaart: het Auxine 250ml-product met prijs, reviews en knoppen.
      const prodHead = step6.querySelector('.product-section .section-head'); // kop-blok van de productsectie
      if (prodHead) {
        const eb = prodHead.querySelector('.eyebrow');                // klein kopje
        const h2 = prodHead.querySelector('h2');                      // sectietitel
        const sub = prodHead.querySelector('.sub');                   // ondertitel
        if (eb) eb.textContent = t.prod_eyebrow;                      // kopje vertalen
        if (h2) h2.innerHTML = t.prod_h2;                             // titel vertalen
        if (sub) sub.textContent = t.prod_sub;                        // ondertitel vertalen
      }
      const prodBadge = step6.querySelector('.product-corner-badge'); // hoek-badge ("bestseller")
      const prodBestseller = step6.querySelector('.bestseller');      // bestseller-regel
      const prodReviews = step6.querySelector('.reviews-text');       // reviews-tekst
      const prodDesc = step6.querySelector('.product-info .desc');    // productomschrijving
      const prodChecks = step6.querySelectorAll('.check-list li');    // de check-lijst onder het product
      const prodStock = step6.querySelector('.price-stock');          // voorraad-tekst
      const prodCtas = step6.querySelectorAll('.cta-row a.btn');      // de actieknoppen (winkelmand/info)
      const prodTrust = step6.querySelectorAll('.trust-row span');    // de vertrouwens-balk (levering/retour)
      if (prodBadge) prodBadge.textContent = t.prod_badge;            // badge vertalen
      if (prodBestseller) prodBestseller.textContent = t.prod_bestseller; // bestseller-tekst vertalen
      if (prodReviews) prodReviews.textContent = t.prod_reviews;      // reviews vertalen
      if (prodDesc) prodDesc.innerHTML = t.prod_desc;                 // omschrijving vertalen (mag HTML)
      prodChecks.forEach((li, i) => {                                 // elke check-regel langslopen
        if (t.prod_checks[i]) li.innerHTML = '<span class="check-mini">✓</span> ' + t.prod_checks[i]; // vinkje + tekst
      });
      if (prodStock) prodStock.textContent = t.prod_stock;            // voorraad-tekst vertalen
      if (prodCtas[0]) {                                              // 1e knop (winkelmand) opbouwen met pijltje
        let arrow = prodCtas[0].querySelector('.btn-arrow');          // bestaand pijltje zoeken
        prodCtas[0].textContent = t.prod_cta + ' ';                   // knoptekst vertalen
        if (!arrow) { arrow = document.createElement('span'); arrow.className = 'btn-arrow'; arrow.textContent = '→'; } // pijltje maken
        prodCtas[0].appendChild(arrow);                               // pijltje toevoegen
      }
      if (prodCtas[1]) prodCtas[1].textContent = t.prod_cta2;         // 2e knop ("meer informatie") vertalen
      prodTrust.forEach((sp, i) => { if (t.prod_trust[i]) sp.textContent = t.prod_trust[i]; }); // vertrouwens-balk vertalen

      // "Zo gebruikt u Auxine"-sectie: de 4 toepassingsstappen.
      const appHead = step6.querySelector('.application .section-head'); // kop-blok van de sectie
      if (appHead) {
        const eb = appHead.querySelector('.eyebrow');                 // klein kopje
        const h2 = appHead.querySelector('h2');                       // sectietitel
        const sub = appHead.querySelector('.sub');                    // ondertitel
        if (eb) eb.textContent = t.app_eyebrow;                       // kopje vertalen
        if (h2) h2.innerHTML = t.app_h2;                              // titel vertalen
        if (sub) sub.textContent = t.app_sub;                         // ondertitel vertalen
      }
      const appSteps = step6.querySelectorAll('.app-steps .app-step'); // de 4 stappen
      appSteps.forEach((step, i) => {                                 // elke stap langslopen
        const s = t.app_steps[i];                                     // bijbehorende vertaling
        if (!s) return;                                               // geen vertaling? overslaan
        const h4 = step.querySelector('h4');                          // staptitel
        const p = step.querySelector('p');                            // staptekst
        if (h4) h4.textContent = s.h;                                 // titel vertalen
        if (p) p.textContent = s.p;                                   // tekst vertalen
      });

      // Bronnen-sectie: de wetenschappelijke bronnen onderaan het rapport.
      const srcHead = step6.querySelector('.sources-section .section-head'); // kop-blok van de sectie
      if (srcHead) {
        const eb = srcHead.querySelector('.eyebrow');                 // klein kopje
        const h2 = srcHead.querySelector('h2');                       // sectietitel
        const sub = srcHead.querySelector('.sub');                    // ondertitel
        if (eb) eb.textContent = t.src_eyebrow;                       // kopje vertalen
        if (h2) h2.innerHTML = t.src_h2;                              // titel vertalen
        if (sub) sub.textContent = t.src_sub;                         // ondertitel vertalen
      }
      const sourceItems = step6.querySelectorAll('.sources-list .source'); // alle bron-items
      sourceItems.forEach((src, i) => {                               // elke bron langslopen
        const sObj = t.sources[i];                                    // bijbehorende vertaling
        if (!sObj) return;                                            // geen vertaling? overslaan
        const h4 = src.querySelector('h4');                           // brontitel
        const meta = src.querySelector('.meta');                      // bron-metagegevens
        if (h4) h4.textContent = sObj.h;                              // titel vertalen
        if (meta) meta.innerHTML = '<strong>' + sObj.s + '</strong>' + sObj.m; // bron + beschrijving (vetgedrukte bron)
      });
    }

    const toggleBtn = document.getElementById('langToggle');          // de taal-wisselknop
    if (toggleBtn) toggleBtn.textContent = t.langToggle;              // toont 'EN' op NL en andersom

    // De geschiedenis-knop en de teksten in de geschiedenis-pop-up vertalen.
    const histBtn = document.getElementById('historyBtn');            // de geschiedenis-knop
    if (histBtn) histBtn.textContent = t.hist_btn;                    // knop vertalen
    const histTitle = document.getElementById('historyTitle');        // titel in de pop-up
    const histSub = document.getElementById('historySub');            // ondertitel in de pop-up
    const histClear = document.getElementById('historyClear');        // "wissen"-knop
    if (histTitle) histTitle.innerHTML = t.hist_title;                // titel vertalen
    if (histSub) histSub.textContent = t.hist_sub;                    // ondertitel vertalen
    if (histClear) histClear.textContent = t.hist_clear;              // wis-knop vertalen
    const histModal = document.getElementById('historyModal');        // de geschiedenis-pop-up zelf
    if (histModal && histModal.classList.contains('open')) View.renderHistoryList(Controller.onHistoryItemClick); // open? lijst opnieuw renderen (datum/labels veranderen mee)
  },

  // --- Diagnose-tekst (het persoonlijke advies op stap 6) ---
  updateDiagnosisText() {
    const el = document.getElementById('diagnosisText');              // het advies-tekstveld
    if (el) el.innerHTML = Model.generateDiagnosisText();             // laat het Model de tekst maken en zet 'm neer
  },

  // --- Teller + scan-knop op stap 4 ---
  updateMultiCount() {
    const t = Model.getT();                                           // vertaalobject
    const multiCount = document.getElementById('multiCount');         // de teller-tekst
    const scanStartBtn = document.getElementById('scanStartBtn');     // de scan-knop
    const n = Model.selectedGoals.size;                               // aantal gekozen doelen
    if (!multiCount || !scanStartBtn) return;                         // elementen er niet? stoppen
    if (n === 0) {                                                    // geen doel gekozen
      multiCount.classList.remove('has-selection');                   // selectie-stijl weghalen
      multiCount.textContent = t.s4_count_zero;                       // "selecteer minimaal 1 doel"
      scanStartBtn.disabled = true;                                   // scan-knop uitschakelen
    } else {                                                          // wel doelen gekozen
      multiCount.classList.add('has-selection');                      // selectie-stijl aanzetten
      const label = n === 1 ? t.s4_count_one : t.s4_count_many;       // enkelvoud bij 1, meervoud bij meer
      multiCount.innerHTML = `<span class="count-pill">${n}</span> ${label}`; // aantal + label tonen
      scanStartBtn.disabled = false;                                  // scan-knop inschakelen
    }
  },

  // --- Plant-optie visueel selecteren (stap 2) ---
  // Geeft de aangeklikte tegel de 'selected'-stijl en haalt 'm bij de rest weg.
  markPlantOption(val) {
    document.querySelectorAll('#opts-2 .option').forEach(o => {       // alle plant-tegels langslopen
      o.classList.toggle('selected', o.getAttribute('data-val') === val); // alleen de gekozen tegel oplichten
    });
  },

  // --- Groeifase-optie visueel selecteren (stap 3) — zelfde principe ---
  markPhaseOption(val) {
    document.querySelectorAll('#opts-3 .option').forEach(o => {       // alle fase-tegels langslopen
      o.classList.toggle('selected', o.getAttribute('data-val') === val); // alleen de gekozen tegel oplichten
    });
  },

  // --- Doel-optie aan/uitvinken (stap 4) ---
  // Hier mag, anders dan plant/fase, meer dan één tegel tegelijk oplichten.
  toggleGoalOption(val, selected) {
    const el = document.querySelector(`#opts-4 .option[data-val="${val}"]`); // de juiste doel-tegel zoeken
    if (el) el.classList.toggle('selected', selected);               // aan of uit zetten op basis van 'selected'
  },

  // --- Foto-preview tonen na upload (stap 1) ---
  showPhotoPreview(url, name, sizeKb) {
    const dropzone = document.getElementById('dropzone');             // de sleep-zone
    const previewCard = document.getElementById('previewCard');       // de preview-kaart
    const previewImg = document.getElementById('previewImg');         // het preview-afbeelding-element
    const fileName = document.getElementById('fileName');             // bestandsnaam-element
    const fileSize = document.getElementById('fileSize');             // bestandsgrootte-element
    if (previewImg) previewImg.src = url;                             // de gekozen foto tonen
    if (fileName) fileName.textContent = name;                       // bestandsnaam tonen
    if (fileSize) fileSize.textContent = '— ' + sizeKb + ' KB · klaar voor analyse'; // grootte + status tonen
    if (dropzone) dropzone.style.display = 'none';                   // sleep-zone verbergen
    if (previewCard) previewCard.classList.add('show');             // preview-kaart tonen
  },

  // Verbergt de foto-preview weer en zet stap 1 terug in begintoestand.
  hidePhotoPreview() {
    const dropzone = document.getElementById('dropzone');             // de sleep-zone
    const previewCard = document.getElementById('previewCard');       // de preview-kaart
    const previewImg = document.getElementById('previewImg');         // preview-afbeelding
    const fileInput = document.getElementById('fileInput');           // de verborgen bestandskiezer
    if (fileInput) fileInput.value = '';                             // bestandskiezer legen (anders blijft oude foto gekozen)
    if (previewImg) previewImg.src = '';                             // preview leegmaken
    if (previewCard) previewCard.classList.remove('show');          // preview-kaart verbergen
    if (dropzone) dropzone.style.display = '';                      // sleep-zone weer tonen
  },

  // --- Geüploade foto in het scan-kader plaatsen (stap 5, tijdens animatie) ---
  injectPhotoIntoScanFrame() {
    const scanFrame = document.getElementById('scanFrame');           // het scan-kader
    if (Model.state.photoUrl && scanFrame) {                         // alleen als er een foto is
      scanFrame.innerHTML = `<img src="${Model.state.photoUrl}" alt="Plant scan" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`; // foto vullend in het kader zetten
    }
  },

  // --- De scan-animatie afspelen (6 fases over ~4.3 seconden) ---
  // Na afloop wordt 'onComplete' aangeroepen (de functie die de Controller meegeeft).
  startScanAnimation(onComplete) {
    const t = Model.getT();                                           // vertaalobject
    const timings = [200, 900, 1700, 2500, 3300, 4100];               // starttijden (ms) van elke fase
    const statusEl = document.getElementById('scanStatus');           // status-regel
    const titleEl = document.getElementById('scanTitle');             // titel-regel
    const barEl = document.getElementById('scanBar');                 // voortgangsbalk
    if (barEl) barEl.style.width = '0%';                             // balk op 0% bij de start
    timings.forEach((time, i) => {                                   // voor elke fase een timer zetten
      setTimeout(() => {                                             // op het juiste moment uitvoeren
        if (statusEl) statusEl.innerHTML = '<span class="dot"></span> ' + t.scan_phases[i].s; // status bijwerken
        if (titleEl) titleEl.textContent = t.scan_phases[i].t;       // titel bijwerken
        if (barEl) barEl.style.width = ((i + 1) / timings.length * 100) + '%'; // balk naar verhouding vullen
      }, time);
    });
    setTimeout(() => { if (typeof onComplete === 'function') onComplete(); }, 4900); // na 4,9s de afrond-functie aanroepen
  },

  // --- De resultatenpagina vullen met de gegevens van deze scan (stap 6) ---
  renderScanResults() {
    const reportIdEl = document.getElementById('reportId');           // rapportnummer-element
    const numEl = document.getElementById('potentialNum');            // potentieel-getal-element
    const subEl = document.getElementById('potentialSub');            // uitleg-zin onder het getal
    if (reportIdEl) reportIdEl.textContent = Model.state.reportId || ''; // rapportnummer tonen
    if (numEl) numEl.textContent = '+' + (Model.state.potential || 0); // potentieel-percentage tonen
    if (subEl) subEl.textContent = Model.generateScorecardSub();      // bijbehorende uitleg-zin tonen

    const resultImg = document.getElementById('resultImg');           // foto-element in de resultaatkaart
    const photoResult = document.getElementById('photoResult');       // de fotokaart zelf
    if (Model.state.photoUrl && resultImg && photoResult) {           // is er een foto?
      resultImg.src = Model.state.photoUrl;                          // foto tonen
      photoResult.classList.add('show');                             // kaart zichtbaar maken
    } else if (photoResult) {                                        // geen foto?
      photoResult.classList.remove('show');                          // kaart verbergen
    }

    this.updateDiagnosisText();                                       // het persoonlijke advies erbij zetten
  },

  // --- Algemene pop-up (modal) bediening ---
  // Eén paar functies voor álle modals: open en dicht via de 'open'-klasse.
  openModal(id) {
    const m = document.getElementById(id);                            // de modal opzoeken op id
    if (m) m.classList.add('open');                                  // zichtbaar maken
  },
  closeModal(id) {
    const m = document.getElementById(id);                            // de modal opzoeken op id
    if (m) m.classList.remove('open');                               // verbergen
  },

  // --- De lijst met eerdere scans opbouwen (geschiedenis-modal) ---
  // 'onItemClick' is de functie die draait als je op een scan klikt.
  renderHistoryList(onItemClick) {
    const t = Model.getT();                                           // vertaalobject
    const list = Model.loadHistory();                                 // opgeslagen scans ophalen
    const listEl = document.getElementById('historyList');            // het lijst-element
    if (!listEl) return;                                              // bestaat niet? stoppen
    if (list.length === 0) {                                          // nog geen scans?
      listEl.innerHTML = '<div class="history-empty">' + t.hist_empty + '</div>'; // "nog niks"-melding tonen
      return;                                                         // en stoppen
    }
    listEl.innerHTML = list.map(scan => {                             // voor elke scan een rijtje HTML maken
      const date = new Date(scan.date).toLocaleDateString(            // datum netjes formatteren
        Model.state.lang === 'nl' ? 'nl-NL' : 'en-US',               // NL- of EN-notatie afhankelijk van taal
        { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' } // dag/maand/jaar/uur/minuut
      );
      const plantLabel = t.opts[scan.plantType] ? t.opts[scan.plantType].l : '—'; // gewas-label opzoeken
      const phaseLabel = t.opts[scan.phase] ? t.opts[scan.phase].l : '—';         // fase-label opzoeken
      const thumb = scan.photoUrl                                     // is er een foto bij deze scan?
        ? `<img class="history-thumb" src="${scan.photoUrl}" alt="" />` // ja: thumbnail tonen
        : `<div class="history-thumb"></div>`;                       // nee: leeg vakje
      return `
        <div class="history-item" data-id="${scan.id}">
          ${thumb}
          <div class="history-info">
            <h4>${plantLabel} · ${phaseLabel}</h4>
            <div class="meta">#${scan.id} · ${date}</div>
          </div>
          <div class="history-potential">+${scan.potential}%</div>
        </div>
      `;                                                              // het rijtje met thumbnail, labels en potentieel
    }).join('');                                                      // alle rijtjes aan elkaar plakken
    if (typeof onItemClick === 'function') {                          // is er een klik-actie meegegeven?
      listEl.querySelectorAll('.history-item').forEach(el => {        // aan elk rijtje
        el.addEventListener('click', () => onItemClick(el.getAttribute('data-id'))); // een klik-actie hangen die de scan heropent
      });
    }
  },

  // --- De drie toestanden van de e-mail pop-up ---
  // 1) Terug naar het formulier (verberg de succes-melding).
  resetEmailModal() {
    const form = document.getElementById('emailForm');                // het e-mailformulier
    const success = document.getElementById('emailSuccess');          // de succes-melding
    if (form) form.classList.remove('hide');                         // formulier weer tonen
    if (success) success.classList.remove('show');                  // succes-melding verbergen
  },
  // 2) Succes tonen: formulier verbergen, bevestiging tonen met het gebruikte adres.
  showEmailSuccess(addr) {
    const form = document.getElementById('emailForm');                // het e-mailformulier
    const success = document.getElementById('emailSuccess');          // de succes-melding
    const successAddr = document.getElementById('emailSuccessAddr');  // plek voor het e-mailadres
    if (form) form.classList.add('hide');                            // formulier verbergen
    if (success) success.classList.add('show');                     // succes-melding tonen
    if (successAddr) successAddr.textContent = addr;                 // het gebruikte adres tonen
  },
  // 3) Verzendknop aan/uit zetten (uit als naam/adres nog niet geldig zijn).
  setEmailSendEnabled(enabled) {
    const btn = document.getElementById('emailSendBtn');              // de verzendknop
    if (btn) btn.disabled = !enabled;                                // aan als 'enabled' true is, anders uit
  },

  // Visuele reset bij een nieuwe scan: alle markeringen en preview leegmaken.
  // Dit is de View-kant van de bugfix: zonder dit bleef de vorige scan zichtbaar.
  resetAll() {
    this.hidePhotoPreview();                                          // foto-preview verbergen + bestandskiezer legen
    document.querySelectorAll('#opts-2 .option, #opts-3 .option, #opts-4 .option').forEach(o => { // alle keuze-tegels
      o.classList.remove('selected');                                // markeringen weghalen
    });
    this.updateMultiCount();                                          // teller + scan-knop terug naar begintoestand
    const photoResult = document.getElementById('photoResult');       // de fotokaart op de resultatenpagina
    if (photoResult) photoResult.classList.remove('show');           // fotokaart verbergen
  },

  // --- Rapport printen ---
  // Opent het print-venster van de browser. De @media print stylesheet in style.css
  // zorgt dat knoppen, pop-ups en navigatie niet meegeprint worden.
  print() {
    window.print();                                                   // opent de print-dialoog van de browser
  }
};
