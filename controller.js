// controller.js — Plant Scanner MVC: Controller-laag
// Alle event-handlers. Vangt user-input op, geeft door aan Model en
// vraagt View om opnieuw te renderen. Bevat zelf geen DOM-manipulatie of data.

const Controller = {

  // --- Init: alles aan elkaar knopen ---
  init() {
    this.bindNavigation();
    this.bindLangToggle();
    this.bindPhotoUpload();
    this.bindPlantOptions();
    this.bindPhaseOptions();
    this.bindGoalOptions();
    this.bindScanStart();
    this.bindHistoryModal();
    this.bindEmailModal();

    // Eerste keer renderen
    View.applyLang();
  },

  // --- Stap-navigatie (knoppen met data-goto attribuut) ---
  bindNavigation() {
    document.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-goto');
        View.navigateTo(target);
      });
    });
  },

  // --- Taalswitch ---
  bindLangToggle() {
    const btn = document.getElementById('langToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      Model.toggleLang();
      View.applyLang();
    });
  },

  // --- Foto upload (stap 1) ---
  bindPhotoUpload() {
    const chooseBtn = document.getElementById('chooseBtn');
    const fileInput = document.getElementById('fileInput');
    const removePhotoBtn = document.getElementById('removePhotoBtn');

    if (chooseBtn && fileInput) {
      chooseBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('Selecteer een afbeelding (JPG, PNG of WEBP).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Bestand te groot — maximaal 10 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        Model.setPhotoUrl(ev.target.result);
        View.showPhotoPreview(ev.target.result, file.name, (file.size / 1024).toFixed(0));
      };
      reader.readAsDataURL(file);
    });

    if (removePhotoBtn) removePhotoBtn.addEventListener('click', () => {
      Model.setPhotoUrl(null);
      View.hidePhotoPreview();
    });
  },

  // --- Gewas-opties (stap 2) ---
  bindPlantOptions() {
    document.querySelectorAll('#opts-2 .option').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-val');
        Model.setPlantType(val);
        View.markPlantOption(val);
        setTimeout(() => View.navigateTo(3), 250);
      });
    });
  },

  // --- Groeifase-opties (stap 3) ---
  bindPhaseOptions() {
    document.querySelectorAll('#opts-3 .option').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-val');
        Model.setPhase(val);
        View.markPhaseOption(val);
        setTimeout(() => View.navigateTo(4), 250);
      });
    });
  },

  // --- Verbeterdoelen multi-select (stap 4) ---
  bindGoalOptions() {
    document.querySelectorAll('#opts-4 .option').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-val');
        const nowSelected = Model.toggleGoal(val);
        View.toggleGoalOption(val, nowSelected);
        View.updateMultiCount();
      });
    });
  },

  // --- Start scan (knop op stap 4) ---
  bindScanStart() {
    const btn = document.getElementById('scanStartBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      View.injectPhotoIntoScanFrame();
      View.navigateTo(5);
      View.startScanAnimation(() => this.onScanComplete());
    });
  },

  // --- Wat te doen wanneer scan-animatie klaar is ---
  onScanComplete() {
    Model.calculatePotential();
    Model.generateReportId();
    Model.saveCurrentScan();
    View.renderScanResults();
    View.navigateTo(6);
  },

  // --- Geschiedenis-modal ---
  bindHistoryModal() {
    const historyBtn = document.getElementById('historyBtn');
    const historyModal = document.getElementById('historyModal');
    const historyClose = document.getElementById('historyClose');
    const historyClear = document.getElementById('historyClear');
    const self = this;

    if (historyBtn) historyBtn.addEventListener('click', () => {
      View.renderHistoryList((id) => self.onHistoryItemClick(id));
      View.openModal('historyModal');
    });
    if (historyClose) historyClose.addEventListener('click', () => View.closeModal('historyModal'));
    if (historyModal) historyModal.addEventListener('click', (e) => {
      if (e.target === historyModal) View.closeModal('historyModal');
    });
    if (historyClear) historyClear.addEventListener('click', () => {
      const t = Model.getT();
      if (confirm(t.hist_clear_confirm)) {
        Model.clearHistory();
        View.renderHistoryList((id) => self.onHistoryItemClick(id));
      }
    });
  },

  // --- Klik op een opgeslagen scan in geschiedenis-lijst ---
  onHistoryItemClick(id) {
    const scan = Model.findScan(id);
    if (!scan) return;
    Model.restoreScan(scan);
    View.renderScanResults();
    View.closeModal('historyModal');
    View.navigateTo(6);
  },

  // --- E-mail rapport modal ---
  bindEmailModal() {
    const emailReportBtn = document.getElementById('emailReportBtn');
    const emailModal = document.getElementById('emailModal');
    const emailClose = document.getElementById('emailClose');
    const emailSuccessClose = document.getElementById('emailSuccessClose');
    const emailName = document.getElementById('emailName');
    const emailAddr = document.getElementById('emailAddr');
    const emailSendBtn = document.getElementById('emailSendBtn');

    function validate() {
      const nameOk = emailName && emailName.value.trim().length >= 2;
      const addrOk = Model.isValidEmail(emailAddr ? emailAddr.value : '');
      View.setEmailSendEnabled(nameOk && addrOk);
    }

    if (emailName) emailName.addEventListener('input', validate);
    if (emailAddr) emailAddr.addEventListener('input', validate);

    if (emailReportBtn) emailReportBtn.addEventListener('click', () => {
      View.resetEmailModal();
      View.openModal('emailModal');
      validate();
    });
    if (emailClose) emailClose.addEventListener('click', () => View.closeModal('emailModal'));
    if (emailModal) emailModal.addEventListener('click', (e) => {
      if (e.target === emailModal) View.closeModal('emailModal');
    });
    if (emailSuccessClose) emailSuccessClose.addEventListener('click', () => {
      View.closeModal('emailModal');
    });
    if (emailSendBtn) emailSendBtn.addEventListener('click', () => {
      if (emailSendBtn.disabled) return;
      const addr = emailAddr.value.trim();
      const subject = 'Auxine scan-rapport voor ' + (emailName.value.trim() || 'u');
      const userMsg = document.getElementById('emailMsg');
      const body = Model.buildEmailBody(userMsg ? userMsg.value : '');
      const mailtoUrl = 'mailto:' + encodeURIComponent(addr)
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
      window.location.href = mailtoUrl;
      View.showEmailSuccess(addr);
    });
  }
};

// Start de applicatie zodra de DOM klaar is
document.addEventListener('DOMContentLoaded', () => Controller.init());
