/**
 * RoboNeige 3D — réception des progrès dans Google Sheets.
 *
 * Installation :
 * 1. Crée une feuille Google Sheets, puis Extensions > Apps Script, colle ce code.
 * 2. Paramètres du projet (roue dentée) > Propriétés du script > ajoute TOKEN = une clé secrète de ton choix.
 * 3. Déployer > Nouveau déploiement > Application Web :
 *      Exécuter en tant que : Moi — Accès : Tout le monde.
 * 4. Copie l'URL (…/exec) et la clé dans le jeu : Espace Parents > Google Sheets.
 */

const SHEET_ANSWERS = 'Réponses';
const SHEET_SUMMARY = 'Résumé du jour';
const MAX_EVENTS = 600;

function doGet() {
  return ContentService.createTextOutput('RoboNeige : script prêt.');
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return text_('JSON invalide');
  }

  // Seul le jeu qui connaît la clé peut écrire dans la feuille
  const expected = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!expected || data.token !== expected) return text_('Clé refusée');

  const events = Array.isArray(data.events) ? data.events.slice(0, MAX_EVENTS) : [];
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const answers = getSheet_(ss, SHEET_ANSWERS, ['Date', 'Heure', 'Enfant', 'Mot / phrase', 'Exercice', 'Résultat']);
    const summary = getSheet_(ss, SHEET_SUMMARY, [
      'Date', 'Enfant', 'Niveau', 'Puissance', 'Améliorations', 'Mots lus', 'Mots écrits',
      'Réussite %', 'Minutes jouées', 'Mots à revoir', 'Mis à jour',
    ]);

    const rows = events
      .filter(function (ev) { return ev && ev.type === 'answer'; })
      .map(function (ev) {
        return [
          clean_(ev.date), clean_(ev.time), clean_(ev.profile), clean_(ev.word),
          modeLabel_(ev.mode), ev.correct === true ? '✅ Réussi' : '❌ Erreur',
        ];
      });
    if (rows.length) answers.getRange(answers.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);

    events
      .filter(function (ev) { return ev && ev.type === 'summary'; })
      .forEach(function (ev) { upsertSummary_(summary, ev); });
  } finally {
    lock.releaseLock();
  }
  return text_('ok');
}

// Une ligne par enfant et par jour, mise à jour à chaque envoi
function upsertSummary_(sheet, ev) {
  const row = [
    clean_(ev.date), clean_(ev.profile), num_(ev.level), num_(ev.power), num_(ev.upgrades),
    num_(ev.wordsRead), num_(ev.wordsWritten), num_(ev.accuracy), num_(ev.playMinutesToday),
    clean_(ev.toReview), new Date(),
  ];
  const last = sheet.getLastRow();
  if (last > 1) {
    const keys = sheet.getRange(2, 1, last - 1, 2).getDisplayValues();
    for (let i = keys.length - 1; i >= 0; i--) {
      if (keys[i][0] === row[0] && keys[i][1] === row[1]) {
        sheet.getRange(i + 2, 1, 1, row.length).setValues([row]);
        return;
      }
    }
  }
  sheet.appendRow(row);
}

function getSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#bae6fd');
    sheet.setFrozenRows(1);
    // Garde les dates en texte (AAAA-MM-JJ) pour retrouver les lignes du jour
    sheet.getRange('A:A').setNumberFormat('@');
  }
  return sheet;
}

// Texte court, sans formule (protège contre l'injection de formules)
function clean_(v) {
  const s = String(v == null ? '' : v).slice(0, 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function num_(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

function modeLabel_(mode) {
  if (mode === 'write') return '✍️ Écriture';
  if (mode === 'speak') return '🎤 Lecture à voix haute';
  return '📖 Lecture';
}

function text_(msg) {
  return ContentService.createTextOutput(msg);
}
