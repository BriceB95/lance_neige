// Envoi des progrès vers une feuille Google Sheets via une application web Apps Script.
// Les événements sont mis en file d'attente localement puis envoyés par paquets.

const QUEUE_KEY = 'roboneige_sync_queue_v1';
const MAX_QUEUE = 500;

export interface AnswerEvent {
  type: 'answer';
  date: string;
  time: string;
  profile: string;
  word: string;
  mode: string;
  correct: boolean;
}

export interface SummaryEvent {
  type: 'summary';
  date: string;
  profile: string;
  level: number;
  power: number;
  upgrades: number;
  wordsRead: number;
  wordsWritten: number;
  accuracy: number;
  playMinutesToday: number;
  toReview: string;
}

type SyncEvent = AnswerEvent | SummaryEvent;

function loadQueue(): SyncEvent[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue: SyncEvent[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE)));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function queueAnswer(profile: string, word: string, mode: string, correct: boolean) {
  const now = new Date();
  const queue = loadQueue();
  queue.push({
    type: 'answer',
    date: now.toLocaleDateString('fr-CA'),
    time: now.toLocaleTimeString('fr-FR'),
    profile,
    word,
    mode,
    correct,
  });
  saveQueue(queue);
}

/**
 * Envoie la file d'attente + le résumé du jour.
 * Apps Script ne renvoie pas d'en-têtes CORS : l'envoi se fait en "no-cors" (réponse illisible),
 * on considère l'envoi réussi si le réseau a répondu.
 */
export async function flushToSheets(url: string, token: string, summary: SummaryEvent): Promise<boolean> {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url.trim())) return false;
  const queue = loadQueue();
  const events: SyncEvent[] = [...queue, summary];
  try {
    await fetch(url.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token, events }),
      keepalive: true,
    });
    // Retire uniquement ce qui a été envoyé (de nouveaux événements ont pu arriver)
    saveQueue(loadQueue().slice(queue.length));
    return true;
  } catch (e) {
    console.warn('Sync error:', e);
    return false;
  }
}

export function isValidSheetsUrl(url: string): boolean {
  return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url.trim());
}
