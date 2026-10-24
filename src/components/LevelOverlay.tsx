import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { speakFrench, playCelebrationFanfare } from '../audio/soundEffects';

interface LevelOverlayProps {
  status: 'playing' | 'won' | 'lost';
  level: number;
  failReason: 'robot' | 'castle';
  nextTitle: string;
  onNext: () => void;
  onRetry: () => void;
}

export const LevelOverlay: React.FC<LevelOverlayProps> = ({
  status,
  level,
  failReason,
  nextTitle,
  onNext,
  onRetry,
}) => {
  useEffect(() => {
    if (status === 'won') {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
      playCelebrationFanfare();
      speakFrench(`Bravo ! Tu as gagné le niveau ${level} !`);
    } else if (status === 'lost') {
      speakFrench(
        failReason === 'castle'
          ? 'Oh non, le château est tombé ! On recommence !'
          : "Oh non, ton robot n'a plus d'énergie ! On recommence !"
      );
    }
  }, [status, level, failReason]);

  if (status === 'playing') return null;
  const won = status === 'won';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div
        className={`w-full max-w-sm rounded-3xl border-4 p-6 text-center text-white flex flex-col items-center gap-3 shadow-2xl bg-gradient-to-b ${
          won ? 'from-sky-900 to-indigo-950 border-amber-300' : 'from-slate-800 to-slate-950 border-rose-400'
        }`}
      >
        <span className="text-6xl">{won ? '🏆' : failReason === 'castle' ? '🏚️' : '🪫'}</span>
        <h2 className="text-2xl font-black">
          {won ? `Niveau ${level} réussi !` : `Niveau ${level} perdu`}
        </h2>
        <p className="text-sm text-sky-200 leading-snug">
          {won
            ? `Prochaine mission : ${nextTitle}`
            : failReason === 'castle'
            ? 'Les bonshommes ont envahi le château. Tes récompenses sont gardées, réessaie !'
            : "Ton robot n'a plus d'énergie. Tes récompenses sont gardées, réessaie !"}
        </p>
        <button
          onClick={won ? onNext : onRetry}
          className={`mt-2 w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer ${
            won ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950' : 'bg-gradient-to-r from-rose-500 to-orange-400 text-white'
          }`}
        >
          {won ? <ArrowRight className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
          {won ? 'Niveau suivant' : 'Recommencer le niveau'}
        </button>
      </div>
    </div>
  );
};
