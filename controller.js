// controller.js — Plant Scanner MVC: Controller-laag
// Alle event-handlers. Vangt user-input op, geeft door aan Model en
// vraagt View om opnieuw te renderen. Bevat zelf geen DOM-manipulatie of data.
//
// De Controller is de 'dirigent': hij luistert naar wat de gebruiker doet
// (klikken, typen, uploaden), laat het Model de data aanpassen en zegt
// daarna tegen de View wat er opnieuw getoond moet worden.

const Controller = {

  // --- Init: alles aan elkaar knopen ---
  // Wordt één keer aangeroepen bij het laden van de pagina. Zet alle
  // losse event-handlers klaar zodat de app op input gaat reageren.
  init() {
    this.bindNavigation();      // knoppen die naar een andere stap gaan
    this.bindLangToggle();      // de NL/EN taalknop
    this.bindPhotoUpload();     // de foto-upload op stap 1
    this.bindPlantOptions();    // de gewas-keuze op stap 2
    this.bindPhaseOptions();    // de fase-keuze op stap 3
    this.bindGoalOptions();     // de doelen-keuze op stap 4
    this.bindScanStart();       // de scan-knop op stap 4
    this.bindHistoryModal();    // de geschiedenis-pop-up
    this.bindEmailModal();      // de e-mail-pop-up
    this.bindPrintReport();     // de print-knop op stap 6

    View.applyLang();           // eerste keer alle teksten in de juiste taal zetten
  },

  // --- Stap-navigatie (knoppen met data-goto attribuut) ---
  // Elke knop met een data-goto vertelt naar welke stap hij moet springen.
  bindNavigation() {
    document.querySelectorAll('[data-goto]').forEach(btn => {          // alle navigatie-knoppen langslopen
      btn.addEventListener('click', () => {                           // bij een klik op zo'n knop:
        const target = btn.getAttribute('data-goto');                 // lees naar welke stap hij moet (bv. '3')
        // Bij 'Nieuwe scan starten' (terug naar step-0): state en UI leegmaken.
        if (target === '0') {                                         // is het de nieuwe-scan-knop?
          Model.reset();                                              // alle data in het Model wissen
          View.resetAll();                                            // alle markeringen/preview in beeld wissen
        }
        View.navigateTo(target);                                      // naar de gevraagde stap navigeren
      });
    });
  },

  // --- Taalswitch ---
  bindLangToggle() {
    const btn = document.getElementById('langToggle');                // de taalknop ophalen
    if (!btn) return;                                                 // niet aanwezig? stoppen
    btn.addEventListener('click', () => {                             // bij een klik op de taalknop:
      Model.toggleLang();                                            // wissel de taal in het Model (nl <-> en)
      View.applyLang();                                              // alle teksten opnieuw in de nieuwe taal zetten
    });
  },

  // --- Foto upload (stap 1) ---
  bindPhotoUpload() {
    const chooseBtn = document.getElementById('chooseBtn');           // de "Foto kiezen"-knop
    const fileInput = document.getElementById('fileInput');           // het verborgen bestandskiezer-veld
    const removePhotoBtn = document.getElementById('removePhotoBtn'); // de "foto verwijderen"-knop

    if (chooseBtn && fileInput) {                                     // beide aanwezig?
      chooseBtn.addEventListener('click', () => fileInput.click());   // klik op de mooie knop opent de echte bestandskiezer
    }

    if (fileInput) fileInput.addEventListener('change', (e) => {      // als de gebruiker een bestand kiest:
      const file = e.target.files[0];                                 // pak het eerste gekozen bestand
      if (!file) return;                                              // niks gekozen? stoppen
      if (!file.type.startsWith('image/')) {                          // is het geen afbeelding?
        alert('Selecteer een afbeelding (JPG, PNG of WEBP).');        // waarschuwing tonen
        return;                                                       // en stoppen (beveiliging tegen verkeerde bestanden)
      }
      if (file.size > 10 * 1024 * 1024) {                             // groter dan 10 MB?
        alert('Bestand te groot — maximaal 10 MB.');                  // waarschuwing tonen
        return;                                                       // en stoppen (voorkomt vastlopen browser)
      }
      const reader = new FileReader();                                // hulpmiddel om het bestand in te lezen
      reader.onload = (ev) => {                                       // zodra het bestand is ingelezen:
        Model.setPhotoUrl(ev.target.result);                         // bewaar de foto in het Model
        View.showPhotoPreview(ev.target.result, file.name, (file.size / 1024).toFixed(0)); // toon de preview met naam + grootte in KB
      };
      reader.readAsDataURL(file);                                     // start het inlezen (als data-URL)
    });

    if (removePhotoBtn) removePhotoBtn.addEventListener('click', () => { // klik op "verwijderen":
      Model.setPhotoUrl(null);                                        // foto uit het Model halen
      View.hidePhotoPreview();                                        // preview verbergen, sleep-zone terug
    });
  },

  // --- Gewas-opties (stap 2) ---
  bindPlantOptions() {
    document.querySelectorAll('#opts-2 .option').forEach(opt => {     // alle gewas-tegels langslopen
      opt.addEventListener('click', () => {                          // bij klik op een tegel:
        const val = opt.getAttribute('data-val');                     // welke gewas-code is aangeklikt
        Model.setPlantType(val);                                      // bewaar de keuze in het Model
        View.markPlantOption(val);                                    // licht de gekozen tegel op
        setTimeout(() => View.navigateTo(3), 250);                    // ga na 250ms automatisch naar stap 3 (korte pauze voor effect)
      });
    });
  },

  // --- Groeifase-opties (stap 3) — zelfde principe als gewas ---
  bindPhaseOptions() {
    document.querySelectorAll('#opts-3 .option').forEach(opt => {     // alle fase-tegels langslopen
      opt.addEventListener('click', () => {                          // bij klik op een tegel:
        const val = opt.getAttribute('data-val');                     // welke fase is aangeklikt
        Model.setPhase(val);                                          // bewaar in het Model
        View.markPhaseOption(val);                                    // licht de gekozen tegel op
        setTimeout(() => View.navigateTo(4), 250);                    // ga na 250ms door naar stap 4
      });
    });
  },

  // --- Verbeterdoelen multi-select (stap 4) ---
  // Anders dan gewas/fase: hier mag de gebruiker meerdere doelen aanvinken.
  bindGoalOptions() {
    document.querySelectorAll('#opts-4 .option').forEach(opt => {     // alle doel-tegels langslopen
      opt.addEventListener('click', () => {                          // bij klik op een doel:
        const val = opt.getAttribute('data-val');                     // welk doel is aangeklikt
        const nowSelected = Model.toggleGoal(val);                    // aan/uit zetten in het Model; geeft terug of het nu aan staat
        View.toggleGoalOption(val, nowSelected);                      // de tegel oplichten of weer dimmen
        View.updateMultiCount();                                      // de teller + scan-knop bijwerken
      });
    });
  },

  // --- Start scan (knop op stap 4) ---
  bindScanStart() {
    const btn = document.getElementById('scanStartBtn');              // de scan-knop ophalen
    if (!btn) return;                                                 // niet aanwezig? stoppen
    btn.addEventListener('click', () => {                            // bij klik op "Start de scan":
      if (btn.disabled) return;                                       // knop uitgeschakeld (geen doel)? niks doen
      View.injectPhotoIntoScanFrame();                                // de foto in het scan-kader plaatsen
      View.navigateTo(5);                                             // naar de scan-pagina gaan
      View.startScanAnimation(() => this.onScanComplete());           // animatie starten; na afloop onScanComplete uitvoeren
    });
  },

  // --- Wat te doen wanneer scan-animatie klaar is ---
  // Deze functie wordt door de animatie aangeroepen zodra die klaar is.
  onScanComplete() {
    Model.calculatePotential();                                       // bereken het groeipotentieel uit de gekozen doelen
    Model.generateReportId();                                         // maak een uniek rapportnummer aan
    Model.saveCurrentScan();                                          // sla deze scan op in de geschiedenis (localStorage)
    View.renderScanResults();                                         // vul de resultatenpagina met alle gegevens
    View.navigateTo(6);                                               // toon de resultatenpagina
  },

  // --- Geschiedenis-modal ---
  bindHistoryModal() {
    const historyBtn = document.getElementById('historyBtn');         // de knop die de geschiedenis opent
    const historyModal = document.getElementById('historyModal');     // de pop-up zelf
    const historyClose = document.getElementById('historyClose');     // het kruisje om te sluiten
    const historyClear = document.getElementById('historyClear');     // de "wissen"-knop
    const self = this;                                                // 'this' bewaren zodat we 'm binnen de callbacks kunnen gebruiken

    if (historyBtn) historyBtn.addEventListener('click', () => {      // klik op de geschiedenis-knop:
      View.renderHistoryList((id) => self.onHistoryItemClick(id));    // de lijst opbouwen, met klik-actie per scan
      View.openModal('historyModal');                                 // de pop-up openen
    });
    if (historyClose) historyClose.addEventListener('click', () => View.closeModal('historyModal')); // kruisje sluit de pop-up
    if (historyModal) historyModal.addEventListener('click', (e) => { // klik ergens in de pop-up-laag:
      if (e.target === historyModal) View.closeModal('historyModal'); // alleen sluiten als je náást de inhoud klikt (op de donkere achtergrond)
    });
    if (historyClear) historyClear.addEventListener('click', () => {  // klik op "wissen":
      const t = Model.getT();                                         // vertaalobject (voor de bevestigingstekst)
      if (confirm(t.hist_clear_confirm)) {                            // vraag eerst om bevestiging
        Model.clearHistory();                                         // alle scans wissen
        View.renderHistoryList((id) => self.onHistoryItemClick(id));  // lege lijst opnieuw tonen
      }
    });
  },

  // --- Klik op een opgeslagen scan in geschiedenis-lijst ---
  onHistoryItemClick(id) {
    const scan = Model.findScan(id);                                  // de aangeklikte scan opzoeken op id
    if (!scan) return;                                                // niet gevonden? stoppen
    Model.restoreScan(scan);                                          // de oude scan terugzetten in het Model
    View.renderScanResults();                                         // de resultatenpagina ermee vullen
    View.closeModal('historyModal');                                  // de pop-up sluiten
    View.navigateTo(6);                                               // de resultatenpagina tonen
  },

  // --- Print rapport (knop op stap 6) ---
  bindPrintReport() {
    const btn = document.getElementById('printReportBtn');            // de print-knop ophalen
    if (!btn) return;                                                 // niet aanwezig? stoppen
    btn.addEventListener('click', () => View.print());                // klik opent het print-venster van de browser
  },

  // --- E-mail rapport modal ---
  bindEmailModal() {
    const emailReportBtn = document.getElementById('emailReportBtn'); // knop die de e-mail-pop-up opent
    const emailModal = document.getElementById('emailModal');         // de pop-up zelf
    const emailClose = document.getElementById('emailClose');         // kruisje om te sluiten
    const emailSuccessClose = document.getElementById('emailSuccessClose'); // sluitknop op de succes-melding
    const emailName = document.getElementById('emailName');           // invoerveld naam
    const emailAddr = document.getElementById('emailAddr');           // invoerveld e-mailadres
    const emailSendBtn = document.getElementById('emailSendBtn');     // de verzendknop

    function validate() {                                             // controleert of het formulier ingevuld mag worden verzonden
      const nameOk = emailName && emailName.value.trim().length >= 2; // naam moet minstens 2 tekens zijn
      const addrOk = Model.isValidEmail(emailAddr ? emailAddr.value : ''); // adres moet een geldig e-mailformaat hebben
      View.setEmailSendEnabled(nameOk && addrOk);                     // verzendknop alleen aan als beide kloppen
    }

    if (emailName) emailName.addEventListener('input', validate);     // bij elke toetsaanslag in 'naam' opnieuw controleren
    if (emailAddr) emailAddr.addEventListener('input', validate);     // bij elke toetsaanslag in 'adres' opnieuw controleren

    if (emailReportBtn) emailReportBtn.addEventListener('click', () => { // klik op "E-mail rapport":
      View.resetEmailModal();                                         // pop-up terug naar het formulier (geen oude succes-melding)
      View.openModal('emailModal');                                   // pop-up openen
      validate();                                                     // meteen controleren (knop staat dan nog uit)
    });
    if (emailClose) emailClose.addEventListener('click', () => View.closeModal('emailModal')); // kruisje sluit
    if (emailModal) emailModal.addEventListener('click', (e) => {     // klik in de pop-up-laag:
      if (e.target === emailModal) View.closeModal('emailModal');     // alleen sluiten bij klik op de donkere achtergrond
    });
    if (emailSuccessClose) emailSuccessClose.addEventListener('click', () => { // sluitknop op de succes-melding:
      View.closeModal('emailModal');                                  // pop-up sluiten
    });
    if (emailSendBtn) emailSendBtn.addEventListener('click', () => {  // klik op "Verzenden":
      if (emailSendBtn.disabled) return;                              // knop uit? niks doen
      const addr = emailAddr.value.trim();                            // het ingevulde e-mailadres
      const subject = 'Auxine scan-rapport voor ' + (emailName.value.trim() || 'u'); // onderwerp van de mail
      const userMsg = document.getElementById('emailMsg');            // optioneel bericht-veld
      const body = Model.buildEmailBody(userMsg ? userMsg.value : ''); // de complete e-mailtekst laten opbouwen door het Model
      const mailtoUrl = 'mailto:' + encodeURIComponent(addr)          // mailto-link opbouwen; encodeURIComponent maakt de tekst veilig
        + '?subject=' + encodeURIComponent(subject)                   // onderwerp toevoegen (ge-encodeerd)
        + '&body=' + encodeURIComponent(body);                        // tekst toevoegen (ge-encodeerd)
      window.location.href = mailtoUrl;                               // open de mailclient van de gebruiker met alles ingevuld
      View.showEmailSuccess(addr);                                    // toon de bevestiging in de pop-up
    });
  }
};

// Start de applicatie zodra de DOM klaar is.
// DOMContentLoaded = "de HTML is volledig geladen"; pas dan bestaan alle elementen
// waar de Controller naar zoekt, dus dan is het veilig om init() te draaien.
document.addEventListener('DOMContentLoaded', () => Controller.init());
