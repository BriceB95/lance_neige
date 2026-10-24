import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle, RotateCcw } from 'lucide-react';
import { CurriculumItem, UpgradeItem } from '../types';
import { pickDistractors } from '../data/curriculum';
import { speakFrench, playSuccessChime, playUpgradeUnlock } from '../audio/soundEffects';

export interface ChallengeResult {
  word: string;
  mode: 'read' | 'write';
}

interface ChallengeRunnerProps {
  upgrade: UpgradeItem;
  items: CurriculumItem[];
  onAnswer: (correct: boolean) => void;
  onComplete: (results: ChallengeResult[]) => void;
  onCancel: () => void;
}

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

// Lettres d'un mot, ou mots d'une phrase
const tokensOf = (item: CurriculumItem): string[] =>
  item.type === 'sentence' ? item.content.split(' ') : Array.from(item.content);

export const ChallengeRunner: React.FC<ChallengeRunnerProps> = ({ upgrade, items, onAnswer, onComplete, onCancel }) => {
  // Alterne lecture et écriture d'un défi à l'autre
  const [modes] = useState<('read' | 'write')[]>(() => {
    const start = Math.random() < 0.5 ? 0 : 1;
    return items.map((_, i) => ((start + i) % 2 === 0 ? 'read' : 'write'));
  });
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number[]>([]); // indices des jetons choisis (écriture)
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showListen, setShowListen] = useState(false);
  const [checked, setChecked] = useState(false);

  const item = items[index];
  const mode = modes[index];
  const target = useMemo(() => tokensOf(item), [item]);
  const scrambled = useMemo(() => {
    let s = shuffle(target.map((t, i) => ({ t, i })));
    for (let tries = 0; tries < 5 && target.length > 1 && s.every((x, k) => x.t === target[k]); tries++) {
      s = shuffle(s);
    }
    return s;
  }, [target]);
  const choices = useMemo(() => shuffle([item.emoji, ...pickDistractors(item)]), [item]);

  useEffect(() => {
    setPicked([]);
    setWrongChoice(null);
    setFeedback(null);
    setChecked(false);
    // En lecture, l'audio n'est proposé qu'après une erreur ; en écriture, c'est une dictée
    setShowListen(mode === 'write');
    if (mode === 'write') speakFrench(item.content);
  }, [index]);

  const succeed = () => {
    onAnswer(true);
    playSuccessChime();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    setFeedback({ ok: true, msg: index + 1 < items.length ? '⭐ Bravo ! Défi suivant…' : '🎉 Bravo ! Amélioration débloquée !' });
    setTimeout(() => {
      if (index + 1 < items.length) {
        setIndex(index + 1);
      } else {
        playUpgradeUnlock();
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
        speakFrench(`Bravo ! Tu as débloqué ${upgrade.name} !`);
        onComplete(items.map((it, i) => ({ word: it.content, mode: modes[i] })));
      }
    }, 1300);
  };

  const fail = (msg: string) => {
    onAnswer(false);
    setFeedback({ ok: false, msg });
    speakFrench('Presque ! Réessaie doucement.');
    setShowListen(true);
  };

  const handleChoice = (emoji: string) => {
    if (feedback?.ok) return;
    if (emoji === item.emoji) {
      setWrongChoice(null);
      succeed();
    } else {
      setWrongChoice(emoji);
      fail('Ce n\'est pas cette image. Relis bien le mot, syllabe par syllabe !');
    }
  };

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

  return (
    <div className="bg-sky-950/90 rounded-2xl p-4 border-2 border-sky-400/60 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-sky-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{upgrade.icon}</span>
          <div>
            <h3 className="font-extrabold text-base text-amber-300">{upgrade.name}</h3>
            <p className="text-xs text-sky-200">
              Défi {index + 1} / {items.length} • {mode === 'read' ? '📖 Lecture' : '✍️ Écriture'}
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
            onClick={() => speakFrench(item.content)}
            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-90 transition-transform cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            Écouter
          </button>
        )}
      </div>

      {mode === 'read' ? (
        <div className="text-center">
          <p className="text-xs text-sky-300 font-semibold">
            Lis {item.type === 'sentence' ? 'la phrase' : 'le mot'}, puis touche la bonne image !
          </p>
          {item.syllables ? (
            <div className="flex justify-center flex-wrap gap-2 my-3">
              {item.syllables.map((syl, i) => (
                <button
                  key={i}
                  onClick={() => speakFrench(syl)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 border-2 border-white text-2xl font-black text-white shadow-lg active:scale-95 transition-transform cursor-pointer"
                >
                  {syl}
                </button>
              ))}
            </div>
          ) : (
            <div className="my-3 p-3 rounded-2xl bg-white/10 border-2 border-cyan-400 text-xl sm:text-2xl font-extrabold">
              {item.content}
            </div>
          )}
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
          {item.explanation && item.syllables && (
            <p className="text-[11px] text-sky-200 italic mt-1">« {item.explanation} »</p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs text-sky-300 font-semibold">
            {item.type === 'sentence'
              ? 'Écoute la phrase et remets les mots dans le bon ordre !'
              : 'Écoute le mot et écris-le avec les lettres !'}
          </p>
          <div className="text-5xl my-2">{item.emoji}</div>
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
