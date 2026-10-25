// Reconnaissance vocale du navigateur (Chrome, Edge, Safari récents), gratuite et sans serveur

type RecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const Recognition: RecognitionCtor | undefined =
  typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : undefined;

export const speechRecognitionSupported = !!Recognition;

/** Écoute une phrase et renvoie les transcriptions possibles */
export function listenOnce(timeoutMs = 7000): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (!Recognition) {
      reject(new Error('unsupported'));
      return;
    }
    window.speechSynthesis?.cancel();
    const rec = new Recognition();
    rec.lang = 'fr-FR';
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    rec.continuous = false;
    let results: string[] = [];
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      resolve(results);
    };
    const timer = window.setTimeout(() => {
      try {
        rec.stop();
      } catch {
        // déjà arrêté
      }
      finish();
    }, timeoutMs);
    rec.onresult = (e: any) => {
      const res = e.results[0];
      results = Array.from({ length: res.length }, (_, i) => String(res[i].transcript));
    };
    rec.onerror = (e: any) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      if (e.error === 'no-speech' || e.error === 'aborted') resolve([]);
      else reject(new Error(e.error));
    };
    rec.onend = finish;
    rec.start();
  });
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

const close = (a: string, b: string) => distance(a, b) <= Math.max(1, Math.floor(b.length / 5));

/** Vérifie si l'enfant a bien lu le mot ou la phrase (tolère les petites erreurs de reconnaissance) */
export function spokenMatches(target: string, heard: string[]): boolean {
  const t = normalize(target);
  const tWords = t.split(' ');
  return heard.some((h) => {
    const n = normalize(h);
    if (!n) return false;
    const hWords = n.split(' ');
    if (tWords.length === 1) return hWords.some((w) => close(w, t)) || close(n.replace(/ /g, ''), t);
    const found = tWords.filter((tw) => hWords.some((hw) => close(hw, tw))).length;
    return found / tWords.length >= 0.7;
  });
}
