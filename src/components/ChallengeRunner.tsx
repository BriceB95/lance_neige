import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle, RotateCcw, Mic } from 'lucide-react';
import { CurriculumItem } from '../types';
import { pickDistractors, pickWordDistractors } from '../data/curriculum';
import { speakFrench, playSuccessChime, playUpgradeUnlock } from '../audio/soundEffects';
import { listenOnce, speechRecognitionSupported, spokenMatches } from '../audio/speechRecognition';

export type ChallengeMode = 'read' | 'write' | 'speak' | 'blank' | 'story';

export interface ChallengeResult {
  word: string;
  mode: ChallengeMode;
}

interface ChallengeRunnerProps {
  title: string;
  icon: string;
  items: CurriculumItem[];
  pool: CurriculumItem[]; // mots de l'école (pièges écrits)
  voiceEnabled: boolean;
  hard?: boolean; // moins d'aide : pas de syllabes, lettres pièges, images proches
  allowedModes?: ChallengeMode[];
  successMessage?: string;
  onAnswer: (correct: boolean, item: CurriculumItem, mode: ChallengeMode) => void;
  onComplete: (results: ChallengeResult[]) => void;
  onCancel: () => void;
}

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

// Lettres d'un mot, ou mots d'une phrase
const tokensOf = (item: CurriculumItem): string[] =>
  item.type === 'sentence' ? item.content.split(' ') : Array.from(item.content);

// Les phrases à trou et les histoires ont leur propre exercice
const effectiveMode = (item: CurriculumItem, mode: ChallengeMode): ChallengeMode =>
  item.type === 'blank' ? 'blank' : item.type === 'story' ? 'story' : mode;

const DECOY_LETTERS = Array.from('AEIOUÉÈSTRLNMCPDB');

export const ChallengeRunner: React.FC<ChallengeRunnerProps> = ({
  title,
  icon,
  items,
  pool,
  voiceEnabled,
  hard = false,
  allowedModes,
  successMessage,
  onAnswer,
  onComplete,
  onCancel,
}) => {
  const canSpeak = voiceEnabled && speechRecognitionSupported;

  // Alterne les modes d'un défi à l'autre (lecture, écriture, lecture au micro)
  const [modes, setModes] = useState<ChallengeMode[]>(() => {
    const available = (allowedModes ?? ['read', 'write', 'speak']).filter((m) => m !== 'speak' || canSpeak);
    const list = available.length ? available : (['read'] as ChallengeMode[]);
    const start = Math.floor(Math.random() * list.length);
    return items.map((_, i) => list[(start + i) % list.length]);
  });
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number[]>([]); // indices des jetons choisis (écriture)
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showListen, setShowListen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakFails, setSpeakFails] = useState(0);

  const item = items[index];
  const mode = effectiveMode(item, modes[index]);
  // Sans image (mot de l'école), la lecture se fait en retrouvant le mot écrit entendu
  const listenPick = mode === 'read' && !item.emoji;
  const target = useMemo(() => tokensOf(item), [item]);
  const scrambled = useMemo(() => {
    const tokens = target.map((t, i) => ({ t, i }));
    // Dictée difficile : lettres ou mots pièges en plus
    if (hard && item.type === 'word') {
      for (let k = 0; k < 2; k++) tokens.push({ t: DECOY_LETTERS[Math.floor(Math.random() * DECOY_LETTERS.length)], i: -1 });
    } else if (hard && item.type === 'sentence') {
      const decoys = ['le', 'la', 'les', 'un', 'des', 'et', 'est', 'sont', 'dans'].filter((w) => !target.includes(w));
      tokens.push({ t: decoys[Math.floor(Math.random() * decoys.length)], i: -1 });
    }
    let s = shuffle(tokens);
    for (let tries = 0; tries < 5 && target.length > 1 && s.every((x, k) => k >= target.length || x.t === target[k]); tries++) {
      s = shuffle(s);
    }
    return s;
  }, [target, hard, item.type]);
  const choices = useMemo(() => {
    if (item.blank) return shuffle(item.blank.options);
    if (item.story) return shuffle(item.story.options);
    return shuffle(item.emoji ? [item.emoji, ...pickDistractors(item, 2, hard)] : [item.content, ...pickWordDistractors(item, pool)]);
  }, [item, pool, hard]);
  const answer = item.blank?.answer ?? item.story?.answer ?? (item.emoji || item.content);

  useEffect(() => {
    setPicked([]);
    setWrongChoice(null);
    setFeedback(null);
    setChecked(false);
    setSpeakFails(0);
    // En lecture, l'audio n'est proposé qu'après une erreur ; en écriture, c'est une dictée
    setShowListen(mode === 'write' || listenPick);
    if (mode === 'write' || listenPick) speakFrench(item.content);
  }, [index, mode]);

  const succeed = () => {
    onAnswer(true, item, mode);
    playSuccessChime();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    setFeedback({ ok: true, msg: index + 1 < items.length ? '⭐ Bravo ! Défi suivant…' : `🎉 ${successMessage ?? 'Bravo !'}` });
    setTimeout(() => {
      if (index + 1 < items.length) {
        setIndex(index + 1);
      } else {
        playUpgradeUnlock();
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
        onComplete(items.map((it, i) => ({ word: it.content, mode: effectiveMode(it, modes[i]) })));
      }
    }, 1300);
  };

  // Une erreur de reconnaissance vocale n'est pas comptée comme une faute de lecture
  const fail = (msg: string, counts = true) => {
    if (counts) onAnswer(false, item, mode);
    setFeedback({ ok: false, msg });
    speakFrench('Presque ! Réessaie doucement.');
    setShowListen(true);
  };

  const handleChoice = (choice: string) => {
    if (feedback?.ok) return;
    if (choice === answer) {
      setWrongChoice(null);
      succeed();
      return;
    }
    setWrongChoice(choice);
    if (mode === 'blank') fail(`Pas tout à fait. ${item.explanation ?? ''}`);
    else if (mode === 'story') fail('Ce n\'est pas ça. Relis bien l\'histoire !');
    else if (listenPick) fail('Ce n\'est pas ce mot. Écoute encore et regarde bien les lettres !');
    else fail('Ce n\'est pas cette image. Relis bien, syllabe par syllabe !');
  };

  const handleSpeak = async () => {
    if (listening || feedback?.ok) return;
    setListening(true);
    setFeedback(null);
    try {
      const heard = await listenOnce();
      if (spokenMatches(item.content, heard)) {
        succeed();
      } else {
        setSpeakFails((n) => n + 1);
        fail(
          heard.length ? `J'ai entendu « ${heard[0]} ». Relis bien et réessaie !` : 'Je n\'ai rien entendu. Parle bien fort près de l\'écran !',
          false
        );
      }
    } catch {
      setFeedback({ ok: false, msg: 'Le micro ne marche pas ici. Utilise les images !' });
      setSpeakFails(2);
    } finally {
      setListening(false);
    }
  };

  const switchToRead = () => setModes((prev) => prev.map((m, i) => (i === index ? 'read' : m)));

  const handlePick = (k: number) => {
    if (feedback?.ok || picked.includes(k) || picked.length >= target.length) return;
    setChecked(false);
    setFeedback(null);
    setPicked([...picked, k]);
    if (item.type === 'word') speakFrench(scrambled[k].t);
  };

  const handleUnpick = (slot: number) => {
    if (feedback?.ok) return;
    setChecked(false);
    setPicked(picked.filter((_, i) => i !== slot));
  };

  const handleValidate = () => {
    const formed = picked.map((k) => scrambled[k].t);
    setChecked(true);
    if (formed.every((t, i) => t === target[i])) succeed();
    else fail('Oups, regarde les cases rouges et corrige-les !');
  };

  const sep = item.type === 'sentence' ? 'gap-1.5' : 'gap-1';
  const slotSize = item.type === 'sentence' ? 'px-2 h-11 min-w-[44px] text-base' : 'w-10 h-12 sm:w-11 sm:h-14 text-xl sm:text-2xl';
  const modeLabel = {
    write: '✍️ Écriture',
    speak: '🎤 Lecture à voix haute',
    read: '📖 Lecture',
    blank: '🧩 Phrase à compléter',
    story: '📜 Histoire',
  }[mode];

  // Le mot à lire, découpé en syllabes cliquables si possible
  const readingText = item.syllables && !hard ? (
    <div className="flex justify-center flex-wrap gap-2 my-3">
      {item.syllables.map((syl, i) => (
        <button
          key={i}
          onClick={() => mode !== 'speak' && speakFrench(syl)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 border-2 border-white text-2xl font-black text-white shadow-lg active:scale-95 transition-transform cursor-pointer"
        >
          {syl}
        </button>
      ))}
    </div>
  ) : (
    <div className="my-3 p-3 rounded-2xl bg-white/10 border-2 border-cyan-400 text-xl sm:text-2xl font-extrabold">{item.content}</div>
  );

  return (
    <div className="bg-sky-950/90 rounded-2xl p-4 border-2 border-sky-400/60 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-sky-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="font-extrabold text-base text-amber-300">{title}</h3>
            <p className="text-xs text-sky-200">
              Défi {index + 1} / {items.length} • {modeLabel}
              {item.custom && ' • 🏫 Mot de l\'école'}
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="text-xs font-bold text-sky-300 hover:text-white underline cursor-pointer">
          Retour
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 bg-sky-900/60 p-2.5 rounded-xl border border-sky-600/40">
        <p className="text-xs text-amber-200 font-medium flex-1">💡 {item.hint}</p>
        {showListen && (
          <button
            onClick={() => speakFrench(item.story ? item.story.text : item.content)}
            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-90 transition-transform cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            Écouter
          </button>
        )}
      </div>

      {mode === 'blank' && item.blank && (
        <div className="text-center">
          <p className="text-xs text-sky-300 font-semibold">Lis la phrase et choisis le mot qui manque !</p>
          <div className="my-3 p-3 rounded-2xl bg-white/10 border-2 border-cyan-400 text-xl sm:text-2xl font-extrabold">
            {item.blank.text.split('___').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className={`inline-block min-w-[70px] mx-1 px-2 rounded-lg border-b-4 ${feedback?.ok ? 'text-emerald-300 border-emerald-300' : 'text-amber-300 border-amber-300'}`}>
                    {feedback?.ok ? item.blank!.answer : '?'}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2 my-2">
            {choices.map((c) => (
              <button
                key={c}
                onClick={() => handleChoice(c)}
                className={`px-5 py-3 rounded-2xl text-xl font-black border-4 transition-all cursor-pointer active:scale-95 ${
                  feedback?.ok && c === answer
                    ? 'bg-emerald-500/40 border-emerald-300'
                    : wrongChoice === c
                    ? 'bg-rose-500/30 border-rose-400 opacity-60'
                    : 'bg-white/10 border-sky-400/60 hover:border-amber-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'story' && item.story && (
        <div className="text-center">
          <div className="my-2 p-3 rounded-2xl bg-white/10 border-2 border-cyan-400 text-left text-base sm:text-lg font-semibold leading-relaxed">
            <span className="text-3xl float-right ml-2">{item.emoji}</span>
            {item.story.text}
          </div>
          <p className="text-sm font-black text-amber-200 my-2">❓ {item.story.question}</p>
          <div className="flex flex-col gap-2">
            {choices.map((c) => (
              <button
                key={c}
                onClick={() => handleChoice(c)}
                className={`px-4 py-2.5 rounded-2xl text-sm sm:text-base font-bold border-4 transition-all cursor-pointer active:scale-95 ${
                  feedback?.ok && c === answer
                    ? 'bg-emerald-500/40 border-emerald-300'
                    : wrongChoice === c
                    ? 'bg-rose-500/30 border-rose-400 opacity-60'
                    : 'bg-white/10 border-sky-400/60 hover:border-amber-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'read' && listenPick && (
        <div className="text-center">
          <p className="text-xs text-sky-300 font-semibold">Écoute, puis touche le mot que tu as entendu !</p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 my-3">
            {choices.map((c) => (
              <button
                key={c}
                onClick={() => handleChoice(c)}
                className={`px-4 py-3 rounded-2xl text-lg font-black border-4 transition-all cursor-pointer active:scale-95 ${
                  feedback?.ok && c === item.content
                    ? 'bg-emerald-500/40 border-emerald-300'
                    : wrongChoice === c
                    ? 'bg-rose-500/30 border-rose-400 opacity-60'
                    : 'bg-white/10 border-sky-400/60 hover:border-amber-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'read' && !listenPick && (
        <div className="text-center">
          <p className="text-xs text-sky-300 font-semibold">
            Lis {item.type === 'sentence' ? 'la phrase' : 'le mot'}, puis touche la bonne image !
          </p>
          {readingText}
          <div className="flex justify-center gap-3 my-2">
            {choices.map((e) => (
              <button
                key={e}
                onClick={() => handleChoice(e)}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-5xl border-4 flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                  feedback?.ok && e === item.emoji
                    ? 'bg-emerald-500/40 border-emerald-300'
                    : wrongChoice === e
                    ? 'bg-rose-500/30 border-rose-400 opacity-60'
                    : 'bg-white/10 border-sky-400/60 hover:border-amber-300'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          {item.explanation && item.syllables && <p className="text-[11px] text-sky-200 italic mt-1">« {item.explanation} »</p>}
        </div>
      )}

      {mode === 'speak' && (
        <div className="text-center">
          <p className="text-xs text-sky-300 font-semibold">
            Appuie sur le micro et lis {item.type === 'sentence' ? 'la phrase' : 'le mot'} à voix haute !
          </p>
          {readingText}
          <button
            onClick={handleSpeak}
            disabled={listening || feedback?.ok}
            className={`mx-auto mt-1 w-24 h-24 rounded-full border-4 border-white flex flex-col items-center justify-center font-black text-xs shadow-xl transition-all cursor-pointer ${
              listening ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-b from-emerald-400 to-teal-600 active:scale-90'
            }`}
          >
            <Mic className="w-9 h-9" />
            {listening ? 'J\'écoute…' : 'Parler'}
          </button>
          {speakFails >= 2 && !feedback?.ok && (
            <button onClick={switchToRead} className="mt-3 text-xs font-bold text-sky-300 underline cursor-pointer">
              Le micro ne m'entend pas : utiliser les {item.emoji ? 'images' : 'mots'}
            </button>
          )}
        </div>
      )}

      {mode === 'write' && (
        <div className="text-center">
          <p className="text-xs text-sky-300 font-semibold">
            {item.type === 'sentence'
              ? 'Écoute la phrase et remets les mots dans le bon ordre !'
              : 'Écoute le mot et écris-le avec les lettres !'}
          </p>
          {item.emoji && <div className="text-5xl my-2">{item.emoji}</div>}
          <div className={`flex flex-wrap justify-center ${sep} my-2 min-h-[48px]`}>
            {target.map((t, slot) => {
              const k = picked[slot];
              const token = k !== undefined ? scrambled[k].t : null;
              const wrong = checked && token !== null && token !== t;
              return (
                <div
                  key={slot}
                  onClick={() => token && handleUnpick(slot)}
                  className={`${slotSize} rounded-xl border-2 flex items-center justify-center font-black cursor-pointer transition-all ${
                    wrong
                      ? 'bg-rose-500 border-rose-200 text-white'
                      : token
                      ? 'bg-amber-400 border-amber-200 text-slate-950'
                      : 'bg-sky-950/50 border-sky-500/50 text-sky-400/40'
                  }`}
                >
                  {token ?? '_'}
                </div>
              );
            })}
          </div>
          <div className={`flex flex-wrap justify-center ${sep} my-3`}>
            {scrambled.map((s, k) => {
              const used = picked.includes(k);
              return (
                <button
                  key={k}
                  disabled={used}
                  onClick={() => handlePick(k)}
                  className={`${item.type === 'sentence' ? 'px-3 h-11 text-base' : 'w-11 h-11 text-xl'} rounded-xl font-black border-2 transition-all cursor-pointer ${
                    used
                      ? 'bg-slate-800 border-slate-700 text-slate-600 opacity-40 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-400 border-white text-sky-950 shadow-md active:scale-90'
                  }`}
                >
                  {s.t}
                </button>
              );
            })}
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setPicked([]);
                setChecked(false);
                setFeedback(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-sky-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Effacer
            </button>
            <button
              onClick={handleValidate}
              disabled={picked.length !== target.length || feedback?.ok}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                picked.length === target.length
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg active:scale-95'
                  : 'bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Vérifier
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div
          className={`p-2.5 rounded-xl text-center font-bold text-sm border-2 ${
            feedback.ok ? 'bg-emerald-900/80 border-emerald-400 text-emerald-200' : 'bg-rose-900/80 border-rose-400 text-rose-200'
          }`}
        >
          {feedback.msg}
        </div>
      )}
    </div>
  );
};
