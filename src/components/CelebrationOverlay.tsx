import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { StickerReward } from '../types';
import { playCelebrationFanfare, playStickerPeel, speakFrench } from '../audio/soundEffects';

interface CelebrationOverlayProps {
  reward: StickerReward | null;
  onClose: () => void;
  onOpenAlbum: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  reward,
  onClose,
  onOpenAlbum,
}) => {
  useEffect(() => {
    if (!reward) return;

    // Trigger dual confetti cannons
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.2, y: 0.6 },
    });
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.8, y: 0.6 },
    });

    playCelebrationFanfare();
    speakFrench(`Bravo ! Tu as gagné l'autocollant magique : ${reward.name} !`);
  }, [reward]);

  if (!reward) return null;

  const rarityLabel =
    reward.rarity === 'legendary'
      ? '🌟 Autocollant Légendaire d\'Or'
      : reward.rarity === 'rare'
      ? '💎 Autocollant Givré Rare'
      : '🎨 Badge Découverte CP/CE1';

  const rarityBg =
    reward.rarity === 'legendary'
      ? 'from-amber-500/30 to-yellow-300/30 border-amber-300'
      : reward.rarity === 'rare'
      ? 'from-purple-500/30 to-pink-400/30 border-purple-300'
      : 'from-sky-500/30 to-cyan-400/30 border-cyan-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      {/* Background Rotating Sunburst Ray Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-30">
        <div className="w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-amber-300 via-sky-400 to-transparent animate-spin-slow blur-2xl" />
      </div>

      <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-sky-950 via-indigo-950 to-slate-950 rounded-3xl border-4 border-amber-300 shadow-[0_0_50px_rgba(251,191,36,0.4)] p-6 text-center text-white flex flex-col items-center z-10 animate-bounce-subtle">
        {/* Sparkle Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-300 font-extrabold text-xs mb-3">
          <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-spin-slow" />
          RÉCOMPENSE DÉBLOQUÉE !
        </div>

        {/* Big 3D Glowing Sticker Badge */}
        <div className="relative my-3 group">
          {/* Pulsing glow aura */}
          <div
            className="absolute -inset-3 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500"
            style={{ backgroundColor: reward.borderColor }}
          />

          <div
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr ${rarityBg} border-4 flex flex-col items-center justify-center shadow-2xl transform hover:scale-105 transition-transform`}
            style={{ borderColor: reward.borderColor }}
          >
            <span className="text-5xl sm:text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              {reward.icon}
            </span>
          </div>
        </div>

        {/* Title & Tagline */}
        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider mt-1">
          {rarityLabel}
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-sky-200 mt-0.5">
          {reward.name}
        </h3>
        <p className="text-xs sm:text-sm text-sky-200 mt-2 max-w-xs leading-snug">
          {reward.tagline}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-6">
          <button
            onClick={() => {
              playStickerPeel();
              onOpenAlbum();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-950" />
            Mon Carnet d'Autocollants
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sky-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            Continuer ❄️
          </button>
        </div>
      </div>
    </div>
  );
};
