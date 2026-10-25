import React, { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { speakFrench } from '../audio/soundEffects';

interface TimeUpOverlayProps {
  visible: boolean;
  onOpenParentPortal: () => void;
}

export const TimeUpOverlay: React.FC<TimeUpOverlayProps> = ({ visible, onOpenParentPortal }) => {
  useEffect(() => {
    if (visible) {
      speakFrench("C'est l'heure de faire une pause ! Ton robot va se reposer. Reviens jouer demain !");
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-950/95 backdrop-blur-md select-none">
      <div className="w-full max-w-sm rounded-3xl border-4 border-sky-300 bg-gradient-to-b from-sky-900 to-indigo-950 p-6 text-center text-white flex flex-col items-center gap-3 shadow-2xl">
        <span className="text-7xl">😴🤖</span>
        <h2 className="text-2xl font-black">C'est l'heure de la pause !</h2>
        <p className="text-sm text-sky-200 leading-snug">
          Tu as bien joué et bien lu aujourd'hui. Ton robot se repose, reviens demain pour de nouvelles aventures !
        </p>
        <p className="text-xs text-sky-300">Toutes tes récompenses sont gardées. ⭐</p>
        <button
          onClick={onOpenParentPortal}
          className="mt-3 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          Espace Parents
        </button>
      </div>
    </div>
  );
};
