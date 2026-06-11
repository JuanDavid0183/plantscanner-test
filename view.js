// view.js — Plant Scanner MVC: View-laag
// Alle DOM-rendering en -updating. Geen state, geen events.
// Leest van Model (waar nodig) en schrijft naar de DOM.

const View = {

  // --- Navigatie ---
  navigateTo(stepNum) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const step = document.getElementById('step-' + stepNum);
    if (step) step.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // --- Taal/Tekst toepassen op de hele UI (groot, daarom losse functie) ---
  applyLang() {
    const t = Model.getT();
    const step0 = document.getElementById('step-0');
    if (step0) {
      const eyebrow = step0.querySelector('.eyebrow');
      const h1 = step0.querySelector('h1');
      const lede = step0.querySelector('.lede');
      const startBtn = step0.querySelector('.btn[data-goto="1"]');
      const pills = step0.querySelectorAll('.feature-pills .pill');
      if (eyebrow) eyebrow.textContent = t.eyebrow;
      if (h1) h1.innerHTML = t.h1;
      if (lede) lede.textContent = t.lede;
      if (startBtn) {
        let arrow = startBtn.querySelector('.btn-arrow');
        startBtn.textContent = t.startBtn + ' ';
        if (!arrow) { arrow = document.createElement('span'); arrow.className = 'btn-arrow'; arrow.textContent = '→'; }
        startBtn.appendChild(arrow);
      }
      if (pills[0]) pills[0].innerHTML = '<span class="check">✓</span> ' + t.pill1;
      if (pills[1]) pills[1].innerHTML = '<span class="check">✓</span> ' + t.pill2;
      if (pills[2]) pills[2].innerHTML = '<span class="check">✓</span> ' + t.pill3;
      if (pills[3]) pills[3].innerHTML = '<span class="check">✓</span> ' + t.pill4;
    }

    // Stap 1
    const step1 = document.getElementById('step-1');
    if (step1) {
      const title = step1.querySelector('.step-title');
      const sub = step1.querySelector('.step-sub');
      const dropH3 = step1.querySelector('.dropzone h3');
      const dropP = step1.querySelector('.dropzone > p');
      const dropBtn = step1.querySelector('#chooseBtn');
      const dropFmt = step1.querySelector('.dropzone-formats');
      const previewTag = step1.querySelector('.img-tag');
      const continueBtn = step1.querySelector('#continueBtn');
      const backBtn = step1.querySelector('.back-btn');
      if (title) title.innerHTML = t.s1_title;
      if (sub) sub.textContent = t.s1_sub;
      if (dropH3) dropH3.textContent = t.s1_drop_h3;
      if (dropP) dropP.textContent = t.s1_drop_p;
      if (dropBtn) {
        const svg = dropBtn.querySelector('svg');
        dropBtn.textContent = ' ' + t.s1_drop_btn;
        if (svg) dropBtn.insertBefore(svg, dropBtn.firstChild);
      }
      if (dropFmt) dropFmt.textContent = t.s1_drop_formats;
      if (previewTag) previewTag.textContent = t.s1_preview_tag;
      if (continueBtn) {
        let arrow = continueBtn.querySelector('.btn-arrow');
        continueBtn.innerHTML = '<span id="continueBtnText">' + t.s1_continue + '</span>';
        const sp = document.createElement('span');
        sp.className = 'btn-arrow';
        sp.id = 'continueBtnArrow';
        sp.textContent = '→';
        continueBtn.appendChild(sp);
      }
      if (backBtn) backBtn.textContent = t.back;
    }

    // Stappen 2, 3, 4 — titel + sub + back
    [['step-2', 's2_title', 's2_sub'],
     ['step-3', 's3_title', 's3_sub'],
     ['step-4', 's4_title', 's4_sub']].forEach(([id, titleKey, subKey]) => {
      const step = document.getElementById(id);
      if (!step) return;
      const title = step.querySelector('.step-title');
      const sub = step.querySelector('.step-sub');
      const backBtn = step.querySelector('.back-btn');
      if (title) title.innerHTML = t[titleKey];
      if (sub) sub.innerHTML = t[subKey];
      if (backBtn) backBtn.textContent = t.back;
    });

    // Opties op stap 2, 3, 4 (labels + descs op basis van data-val)
    document.querySelectorAll('#opts-2 .option, #opts-3 .option, #opts-4 .option').forEach(opt => {
      const val = opt.getAttribute('data-val');
      const entry = t.opts[val];
      if (!entry) return;
      const labelEl = opt.querySelector('.label');
      const descEl = opt.querySelector('.desc');
      if (labelEl) labelEl.textContent = entry.l;
      if (descEl) descEl.textContent = entry.d;
    });

    // Multi-count + Start de scan op stap 4
    if (typeof updateMultiCount === 'function') updateMultiCount();
    const scanBtn = document.getElementById('scanStartBtn');
    if (scanBtn) {
      let arrow = scanBtn.querySelector('.btn-arrow');
      scanBtn.textContent = t.s4_scan + ' ';
      if (!arrow) { arrow = document.createElement('span'); arrow.className = 'btn-arrow'; arrow.textContent = '→'; }
      scanBtn.appendChild(arrow);
    }

    // Stap 5 — scan-pagina (statische default-tekst, animatie schrijft hier later overheen)
    const scanStatus = document.getElementById('scanStatus');
    const scanTitle = document.getElementById('scanTitle');
    if (scanStatus) scanStatus.innerHTML = '<span class="dot"></span> ' + t.scan_default_status;
    if (scanTitle) scanTitle.textContent = t.scan_default_title;

    // Stap 6 — resultaten-hero + scorecard
    const step6 = document.getElementById('step-6');
    if (step6) {
      const eyebrowLight = step6.querySelector('.eyebrow-light');
      const heroH1 = step6.querySelector('.result-hero h1');
      const heroP = step6.querySelector('.result-hero > div > p');
      const scLabel = step6.querySelector('.scorecard .label');
      const newScanBtn = step6.querySelector('.nav-row .back-btn[data-goto="0"]');
      const reportIdEl = document.getElementById('reportId');
      const reportIdValue = reportIdEl ? reportIdEl.textContent : '';
      if (eyebrowLight) {
        eyebrowLight.innerHTML = t.r_eyebrow + '<span id="reportId">' + reportIdValue + '</span>';
      }
      if (heroH1) heroH1.innerHTML = t.r_h1;
      if (heroP) heroP.textContent = t.r_intro;
      if (scLabel) scLabel.textContent = t.sc_label;
      if (newScanBtn) newScanBtn.textContent = t.newScan;

      // Foto-resultaatkaart
      const prHead = document.querySelector('#photoResult .section-head');
      if (prHead) {
        const h2 = prHead.querySelector('h2');
        const sub = prHead.querySelector('.sub');
        if (h2) h2.innerHTML = t.pr_h2;
        if (sub) sub.textContent = t.pr_sub;
      }
      const badges = document.querySelectorAll('#photoResult .mini-badge');
      if (badges[0]) badges[0].textContent = t.pr_badge1;
      if (badges[1]) badges[1].textContent = t.pr_badge2;
      const prH3 = document.querySelector('#photoResult .photo-result-info h3');
      const prP = document.querySelector('#photoResult .photo-result-info > p');
      if (prH3) prH3.textContent = t.pr_h3;
      if (prP) prP.textContent = t.pr_p;
      const findings = document.querySelectorAll('#photoResult .finding');
      findings.forEach((f, i) => {
        if (t.pr_findings[i]) {
          f.innerHTML = '<span class="check-mini">' + (i + 1) + '</span> ' + t.pr_findings[i];
        }
      });

      // Persoonlijk advies — titel + dynamische tekst
      const advTitleEl = document.getElementById('diagnosisTitle');
      if (advTitleEl) advTitleEl.innerHTML = t.adv_h2;
      // Dynamische tekst alleen updaten als deze al gegenereerd was
      const diagEl = document.getElementById('diagnosisText');
      if (diagEl && Model.state.plantType) updateDiagnosisText();

      // Benefits sectie
      const benHead = step6.querySelector('.benefits-section .section-head');
      if (benHead) {
        const eb = benHead.querySelector('.eyebrow');
        const h2 = benHead.querySelector('h2');
        const sub = benHead.querySelector('.sub');
        if (eb) eb.textContent = t.ben_eyebrow;
        if (h2) h2.innerHTML = t.ben_h2;
        if (sub) sub.textContent = t.ben_sub;
      }
      const benefitCards = step6.querySelectorAll('.benefits .benefit');
      benefitCards.forEach((card, i) => {
        const b = t.benefits[i];
        if (!b) return;
        const h3 = card.querySelector('h3');
        const p = card.querySelector('p');
        const sl = card.querySelector('.stat-label');
        if (h3) h3.textContent = b.h;
        if (p) p.textContent = b.p;
        if (sl) sl.textContent = b.sl;
      });

      // USPs sectie
      const uspHead = step6.querySelector('.usps-section .section-head');
      if (uspHead) {
        const eb = uspHead.querySelector('.eyebrow');
        const h2 = uspHead.querySelector('h2');
        const sub = uspHead.querySelector('.sub');
        if (eb) eb.textContent = t.usp_eyebrow;
        if (h2) h2.innerHTML = t.usp_h2;
        if (sub) sub.textContent = t.usp_sub;
      }
      const uspItems = step6.querySelectorAll('.usp-list .usp-item');
      uspItems.forEach((item, i) => {
        const u = t.usps[i];
        if (!u) return;
        const marker = item.querySelector('.marker');
        const h4 = item.querySelector('h4');
        const p = item.querySelector('p');
        if (marker) marker.textContent = u.m;
        if (h4) h4.textContent = u.h;
        if (p) p.textContent = u.p;
      });

      // Productkaart
      const prodHead = step6.querySelector('.product-section .section-head');
      if (prodHead) {
        const eb = prodHead.querySelector('.eyebrow');
        const h2 = prodHead.querySelector('h2');
        const sub = prodHead.querySelector('.sub');
        if (eb) eb.textContent = t.prod_eyebrow;
        if (h2) h2.innerHTML = t.prod_h2;
        if (sub) sub.textContent = t.prod_sub;
      }
      const prodBadge = step6.querySelector('.product-corner-badge');
      const prodBestseller = step6.querySelector('.bestseller');
      const prodReviews = step6.querySelector('.reviews-text');
      const prodDesc = step6.querySelector('.product-info .desc');
      const prodChecks = step6.querySelectorAll('.check-list li');
      const prodStock = step6.querySelector('.price-stock');
      const prodCtas = step6.querySelectorAll('.cta-row a.btn');
      const prodTrust = step6.querySelectorAll('.trust-row span');
      if (prodBadge) prodBadge.textContent = t.prod_badge;
      if (prodBestseller) prodBestseller.textContent = t.prod_bestseller;
      if (prodReviews) prodReviews.textContent = t.prod_reviews;
      if (prodDesc) prodDesc.innerHTML = t.prod_desc;
      prodChecks.forEach((li, i) => {
        if (t.prod_checks[i]) li.innerHTML = '<span class="check-mini">✓</span> ' + t.prod_checks[i];
      });
      if (prodStock) prodStock.textContent = t.prod_stock;
      if (prodCtas[0]) {
        let arrow = prodCtas[0].querySelector('.btn-arrow');
        prodCtas[0].textContent = t.prod_cta + ' ';
        if (!arrow) { arrow = document.createElement('span'); arrow.className = 'btn-arrow'; arrow.textContent = '→'; }
        prodCtas[0].appendChild(arrow);
      }
      if (prodCtas[1]) prodCtas[1].textContent = t.prod_cta2;
      prodTrust.forEach((sp, i) => { if (t.prod_trust[i]) sp.textContent = t.prod_trust[i]; });

      // Application
      const appHead = step6.querySelector('.application .section-head');
      if (appHead) {
        const eb = appHead.querySelector('.eyebrow');
        const h2 = appHead.querySelector('h2');
        const sub = appHead.querySelector('.sub');
        if (eb) eb.textContent = t.app_eyebrow;
        if (h2) h2.innerHTML = t.app_h2;
        if (sub) sub.textContent = t.app_sub;
      }
      const appSteps = step6.querySelectorAll('.app-steps .app-step');
      appSteps.forEach((step, i) => {
        const s = t.app_steps[i];
        if (!s) return;
        const h4 = step.querySelector('h4');
        const p = step.querySelector('p');
        if (h4) h4.textContent = s.h;
        if (p) p.textContent = s.p;
      });

      // Sources
      const srcHead = step6.querySelector('.sources-section .section-head');
      if (srcHead) {
        const eb = srcHead.querySelector('.eyebrow');
        const h2 = srcHead.querySelector('h2');
        const sub = srcHead.querySelector('.sub');
        if (eb) eb.textContent = t.src_eyebrow;
        if (h2) h2.innerHTML = t.src_h2;
        if (sub) sub.textContent = t.src_sub;
      }
      const sourceItems = step6.querySelectorAll('.sources-list .source');
      sourceItems.forEach((src, i) => {
        const sObj = t.sources[i];
        if (!sObj) return;
        const h4 = src.querySelector('h4');
        const meta = src.querySelector('.meta');
        if (h4) h4.textContent = sObj.h;
        if (meta) meta.innerHTML = '<strong>' + sObj.s + '</strong>' + sObj.m;
      });
    }

    const toggleBtn = document.getElementById('langToggle');
    if (toggleBtn) toggleBtn.textContent = t.langToggle;

    // Geschiedenis-knop + modal
    const histBtn = document.getElementById('historyBtn');
    if (histBtn) histBtn.textContent = t.hist_btn;
    const histTitle = document.getElementById('historyTitle');
    const histSub = document.getElementById('historySub');
    const histClear = document.getElementById('historyClear');
    if (histTitle) histTitle.innerHTML = t.hist_title;
    if (histSub) histSub.textContent = t.hist_sub;
    if (histClear) histClear.textContent = t.hist_clear;
    // Lijst opnieuw renderen als modal open is (datum-format + plant-labels veranderen)
    const histModal = document.getElementById('historyModal');
    if (histModal && histModal.classList.contains('open')) View.renderHistoryList(Controller.onHistoryItemClick);
  },

  // --- Diagnose-tekst (advies) ---
  updateDiagnosisText() {
    const el = document.getElementById('diagnosisText');
    if (el) el.innerHTML = Model.generateDiagnosisText();
  },

  // --- Multi-count + scan-knop op stap 4 ---
  updateMultiCount() {
    const t = Model.getT();
    const multiCount = document.getElementById('multiCount');
    const scanStartBtn = document.getElementById('scanStartBtn');
    const n = Model.selectedGoals.size;
    if (!multiCount || !scanStartBtn) return;
    if (n === 0) {
      multiCount.classList.remove('has-selection');
      multiCount.textContent = t.s4_count_zero;
      scanStartBtn.disabled = true;
    } else {
      multiCount.classList.add('has-selection');
      const label = n === 1 ? t.s4_count_one : t.s4_count_many;
      multiCount.innerHTML = `<span class="count-pill">${n}</span> ${label}`;
      scanStartBtn.disabled = false;
    }
  },

  // --- Plant-optie visueel selecteren ---
  markPlantOption(val) {
    document.querySelectorAll('#opts-2 .option').forEach(o => {
      o.classList.toggle('selected', o.getAttribute('data-val') === val);
    });
  },

  // --- Groeifase-optie visueel selecteren ---
  markPhaseOption(val) {
    document.querySelectorAll('#opts-3 .option').forEach(o => {
      o.classList.toggle('selected', o.getAttribute('data-val') === val);
    });
  },

  // --- Doel-optie aan/uitvinken ---
  toggleGoalOption(val, selected) {
    const el = document.querySelector(`#opts-4 .option[data-val="${val}"]`);
    if (el) el.classList.toggle('selected', selected);
  },

  // --- Foto upload preview (stap 1) ---
  showPhotoPreview(url, name, sizeKb) {
    const dropzone = document.getElementById('dropzone');
    const previewCard = document.getElementById('previewCard');
    const previewImg = document.getElementById('previewImg');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    if (previewImg) previewImg.src = url;
    if (fileName) fileName.textContent = name;
    if (fileSize) fileSize.textContent = '— ' + sizeKb + ' KB · klaar voor analyse';
    if (dropzone) dropzone.style.display = 'none';
    if (previewCard) previewCard.classList.add('show');
  },

  hidePhotoPreview() {
    const dropzone = document.getElementById('dropzone');
    const previewCard = document.getElementById('previewCard');
    const previewImg = document.getElementById('previewImg');
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
    if (previewImg) previewImg.src = '';
    if (previewCard) previewCard.classList.remove('show');
    if (dropzone) dropzone.style.display = '';
  },

  // --- Geüploade foto in scan-frame plaatsen (stap 5) ---
  injectPhotoIntoScanFrame() {
    const scanFrame = document.getElementById('scanFrame');
    if (Model.state.photoUrl && scanFrame) {
      scanFrame.innerHTML = `<img src="${Model.state.photoUrl}" alt="Plant scan" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`;
    }
  },

  // --- Scan-animatie (6 fases over ~4.3s, dan callback) ---
  startScanAnimation(onComplete) {
    const t = Model.getT();
    const timings = [200, 900, 1700, 2500, 3300, 4100];
    const statusEl = document.getElementById('scanStatus');
    const titleEl = document.getElementById('scanTitle');
    const barEl = document.getElementById('scanBar');
    if (barEl) barEl.style.width = '0%';
    timings.forEach((time, i) => {
      setTimeout(() => {
        if (statusEl) statusEl.innerHTML = '<span class="dot"></span> ' + t.scan_phases[i].s;
        if (titleEl) titleEl.textContent = t.scan_phases[i].t;
        if (barEl) barEl.style.width = ((i + 1) / timings.length * 100) + '%';
      }, time);
    });
    setTimeout(() => { if (typeof onComplete === 'function') onComplete(); }, 4900);
  },

  // --- Resultaten-pagina (stap 6) renderen vanuit Model state ---
  renderScanResults() {
    const reportIdEl = document.getElementById('reportId');
    const numEl = document.getElementById('potentialNum');
    const subEl = document.getElementById('potentialSub');
    if (reportIdEl) reportIdEl.textContent = Model.state.reportId || '';
    if (numEl) numEl.textContent = '+' + (Model.state.potential || 0);
    if (subEl) subEl.textContent = Model.generateScorecardSub();

    // Foto in resultaatkaart
    const resultImg = document.getElementById('resultImg');
    const photoResult = document.getElementById('photoResult');
    if (Model.state.photoUrl && resultImg && photoResult) {
      resultImg.src = Model.state.photoUrl;
      photoResult.classList.add('show');
    } else if (photoResult) {
      photoResult.classList.remove('show');
    }

    // Persoonlijk advies
    this.updateDiagnosisText();
  },

  // --- Generieke modal-controls ---
  openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('open');
  },
  closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('open');
  },

  // --- Geschiedenislijst renderen ---
  renderHistoryList(onItemClick) {
    const t = Model.getT();
    const list = Model.loadHistory();
    const listEl = document.getElementById('historyList');
    if (!listEl) return;
    if (list.length === 0) {
      listEl.innerHTML = '<div class="history-empty">' + t.hist_empty + '</div>';
      return;
    }
    listEl.innerHTML = list.map(scan => {
      const date = new Date(scan.date).toLocaleDateString(
        Model.state.lang === 'nl' ? 'nl-NL' : 'en-US',
        { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      );
      const plantLabel = t.opts[scan.plantType] ? t.opts[scan.plantType].l : '—';
      const phaseLabel = t.opts[scan.phase] ? t.opts[scan.phase].l : '—';
      const thumb = scan.photoUrl
        ? `<img class="history-thumb" src="${scan.photoUrl}" alt="" />`
        : `<div class="history-thumb"></div>`;
      return `
        <div class="history-item" data-id="${scan.id}">
          ${thumb}
          <div class="history-info">
            <h4>${plantLabel} · ${phaseLabel}</h4>
            <div class="meta">#${scan.id} · ${date}</div>
          </div>
          <div class="history-potential">+${scan.potential}%</div>
        </div>
      `;
    }).join('');
    if (typeof onItemClick === 'function') {
      listEl.querySelectorAll('.history-item').forEach(el => {
        el.addEventListener('click', () => onItemClick(el.getAttribute('data-id')));
      });
    }
  },

  // --- E-mail modal staten ---
  resetEmailModal() {
    const form = document.getElementById('emailForm');
    const success = document.getElementById('emailSuccess');
    if (form) form.classList.remove('hide');
    if (success) success.classList.remove('show');
  },
  showEmailSuccess(addr) {
    const form = document.getElementById('emailForm');
    const success = document.getElementById('emailSuccess');
    const successAddr = document.getElementById('emailSuccessAddr');
    if (form) form.classList.add('hide');
    if (success) success.classList.add('show');
    if (successAddr) successAddr.textContent = addr;
  },
  setEmailSendEnabled(enabled) {
    const btn = document.getElementById('emailSendBtn');
    if (btn) btn.disabled = !enabled;
  }
};
