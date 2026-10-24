import React, { useState } from 'react';
import { X, Award, Star, Lock, BookOpen, Sparkles, Check, Bookmark } from 'lucide-react';
import { Trophy, StickerReward, RewardCategory } from '../types';
import { playStickerPeel, speakFrench } from '../audio/soundEffects';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trophies: Trophy[];
  stickers: StickerReward[];
  onToggleStickOnAlbum: (stickerId: string) => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  trophies,
  stickers,
  onToggleStickOnAlbum,
}) => {
  const [activeTab, setActiveTab] = useState<'stickers' | 'trophies'>('stickers');
  const [categoryFilter, setCategoryFilter] = useState<'all' | RewardCategory>('all');
  const [inspectedSticker, setInspectedSticker] = useState<StickerReward | null>(null);

  if (!isOpen) return null;

  const unlockedStickersCount = stickers.filter((s) => s.unlockedAt !== null).length;
  const unlockedTrophiesCount = trophies.filter((t) => t.unlockedAt !== null).length;
  const totalCompletionPercent = Math.round(
    ((unlockedStickersCount + unlockedTrophiesCount) / (stickers.length + trophies.length)) * 100
  );

  const filteredStickers = stickers.filter(
    (s) => categoryFilter === 'all' || s.category === categoryFilter
  );

  const handleStickerClick = (sticker: StickerReward) => {
    if (sticker.unlockedAt === null) {
      speakFrench("Cet autocollant est encore verrouillé ! Réussis un défi pour l'obtenir !");
      return;
    }
    playStickerPeel();
    setInspectedSticker(sticker);
    speakFrench(`${sticker.name} ! ${sticker.tagline}`);
  };

  const handleStickToggle = (sticker: StickerReward) => {
    playStickerPeel();
    onToggleStickOnAlbum(sticker.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-sky-950 via-indigo-950 to-slate-950 rounded-3xl border-4 border-amber-300 shadow-[0_0_40px_rgba(251,191,36,0.3)] p-4 sm:p-6 text-white max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform cursor-pointer z-20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Top Header & Navigation */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 px-4 py-1 rounded-full border border-amber-400/50 text-amber-300 font-extrabold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            Galerie Magique de l'Explorateur
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-sky-200">
            Mon Album de Récompenses
          </h2>

          {/* Progress Bar */}
          <div className="max-w-xs mx-auto mt-2">
            <div className="flex justify-between text-[11px] font-bold text-sky-200 mb-1">
              <span>Collection globale</span>
              <span className="text-amber-300 font-black">{totalCompletionPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full p-0.5 border border-sky-600/60 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                style={{ width: `${totalCompletionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Tabs: Stickers vs Trophies */}
        <div className="flex rounded-2xl bg-sky-950/90 p-1 border-2 border-sky-600/60 mb-3 shadow-inner">
          <button
            onClick={() => {
              playStickerPeel();
              setActiveTab('stickers');
            }}
            className={`flex-1 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stickers'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md'
                : 'text-sky-200 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Carnet d'Autocollants ({unlockedStickersCount}/{stickers.length})
          </button>
          <button
            onClick={() => {
              playStickerPeel();
              setActiveTab('trophies');
            }}
            className={`flex-1 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'trophies'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md'
                : 'text-sky-200 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            Trophées Polaires ({unlockedTrophiesCount}/{trophies.length})
          </button>
        </div>

        {/* TAB 1: STICKERS CARNET */}
        {activeTab === 'stickers' && (
          <div className="flex flex-col gap-3">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {[
                { id: 'all', label: 'Tous les Autocollants' },
                { id: 'reading', label: '📖 Lecture & Sons' },
                { id: 'writing', label: '✍️ Écriture' },
                { id: 'robot', label: '🤖 Robot & Pouvoirs' },
                { id: 'snow', label: '❄️ Banquise' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id as 'all' | RewardCategory)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    categoryFilter === f.id
                      ? 'bg-cyan-500 text-sky-950 font-extrabold shadow'
                      : 'bg-slate-900/70 text-sky-300 hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Interactive Snowy Album Page (Canvas where stickers are placed) */}
            <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border-3 border-cyan-300 shadow-xl bg-gradient-to-b from-sky-400 via-sky-200 to-white flex items-center justify-center p-3">
              {/* Decorative arctic background elements */}
              <div className="absolute top-2 left-4 text-xs font-black text-sky-900/60 uppercase tracking-widest pointer-events-none">
                ❄️ Mon Paysage Polaire
              </div>
              <div className="absolute bottom-1 right-3 text-[10px] text-sky-800/60 font-bold pointer-events-none">
                Touche un autocollant pour le coller ici !
              </div>

              {/* Distant Mountains & Igloo SVG illustration */}
              <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-40">
                <svg viewBox="0 0 400 100" className="w-full h-auto">
                  <path d="M0,80 Q50,40 100,75 T200,60 T300,70 T400,55 L400,100 L0,100 Z" fill="#93c5fd" />
                  <path d="M50,90 Q120,60 220,85 T400,75 L400,100 L50,100 Z" fill="#bfdbfe" />
                </svg>
              </div>

              {/* Display all stickers currently stuck on the album page */}
              {stickers
                .filter((s) => s.unlockedAt !== null && s.isStuckOnAlbum)
                .map((stk) => (
                  <div
                    key={stk.id}
                    onClick={() => handleStickerClick(stk)}
                    className="absolute cursor-pointer transition-transform hover:scale-125 active:scale-95 animate-bounce-subtle group"
                    style={{
                      left: `${stk.placedX ?? 50}%`,
                      top: `${stk.placedY ?? 50}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    title={`${stk.name} - ${stk.tagline}`}
                  >
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 bg-white/95"
                      style={{ borderColor: stk.borderColor }}
                    >
                      {stk.icon}
                    </div>
                  </div>
                ))}

              {stickers.filter((s) => s.unlockedAt !== null && s.isStuckOnAlbum).length === 0 && (
                <div className="bg-sky-950/40 backdrop-blur-xs px-4 py-2 rounded-xl text-sky-900 font-extrabold text-xs text-center border border-white/60 shadow">
                  Ton carnet est encore tout blanc ! 🎨<br />
                  Débloque et colle tes autocollants préférés ici !
                </div>
              )}
            </div>

            {/* Peelable Stickers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
              {filteredStickers.map((sticker) => {
                const isUnlocked = sticker.unlockedAt !== null;
                const isStuck = sticker.isStuckOnAlbum;

                return (
                  <div
                    key={sticker.id}
                    onClick={() => isUnlocked && handleStickerClick(sticker)}
                    className={`relative p-3 rounded-2xl border-2 flex flex-col items-center text-center transition-all cursor-pointer ${
                      isUnlocked
                        ? 'bg-slate-900/80 hover:bg-slate-800/90 shadow-lg transform hover:-translate-y-1'
                        : 'bg-slate-950/50 border-slate-800 opacity-50 cursor-not-allowed'
                    }`}
                    style={{ borderColor: isUnlocked ? sticker.borderColor : '#334155' }}
                  >
                    {/* Badge rarity ribbon */}
                    <div className="text-[9px] font-black uppercase tracking-wider mb-1 px-2 py-0.5 rounded-full bg-white/10 text-sky-200">
                      {sticker.rarity === 'legendary' ? '🌟 Légendaire' : sticker.rarity === 'rare' ? '💎 Rare' : '🎨 Découverte'}
                    </div>

                    {/* Shiny Sticker Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl my-1 border-2 transition-transform ${
                        isUnlocked
                          ? 'bg-white/10 shadow-md group-hover:scale-110'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                      style={{ borderColor: isUnlocked ? sticker.borderColor : '#475569' }}
                    >
                      {isUnlocked ? sticker.icon : <Lock className="w-7 h-7 text-slate-600" />}
                    </div>

                    <h4 className="font-black text-xs text-white mt-1 leading-snug line-clamp-1">
                      {sticker.name}
                    </h4>
                    <p className="text-[10px] text-sky-300 line-clamp-2 mt-0.5 leading-tight">
                      {sticker.tagline}
                    </p>

                    {/* Stick / Unstick Action */}
                    {isUnlocked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStickToggle(sticker);
                        }}
                        className={`mt-2 w-full py-1 px-2 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isStuck
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-sky-950'
                        }`}
                      >
                        {isStuck ? (
                          <>
                            <Check className="w-3 h-3" /> Collé sur l'album
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3 h-3" /> Coller sur la page
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: TROPHIES HALL */}
        {activeTab === 'trophies' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            {trophies.map((trophy) => {
              const isUnlocked = trophy.unlockedAt !== null;

              return (
                <div
                  key={trophy.id}
                  className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-r from-amber-500/20 to-sky-500/20 border-amber-300 shadow-md'
                      : 'bg-slate-900/60 border-slate-700/60 opacity-60'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 ${
                      isUnlocked
                        ? 'bg-amber-400/30 border-amber-300 animate-bounce-subtle'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    {isUnlocked ? trophy.icon : <Lock className="w-6 h-6 text-slate-500" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <h3 className="font-extrabold text-sm text-white">{trophy.title}</h3>
                      {isUnlocked && <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />}
                    </div>
                    <p className="text-xs text-sky-200 leading-tight mt-0.5">{trophy.desc}</p>
                    {isUnlocked && (
                      <span className="text-[10px] text-amber-300 font-bold block mt-1">
                        Débloqué avec brio ! ✨
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Inspected Sticker Detail Popup (if child tapped on a sticker) */}
        {inspectedSticker && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-xs bg-slate-900 rounded-3xl border-3 border-amber-400 p-5 text-center text-white shadow-2xl flex flex-col items-center">
              <button
                onClick={() => setInspectedSticker(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl my-2 border-3 bg-white/10 shadow-lg"
                style={{ borderColor: inspectedSticker.borderColor }}
              >
                {inspectedSticker.icon}
              </div>
              <h3 className="text-xl font-black text-amber-300 mt-1">{inspectedSticker.name}</h3>
              <p className="text-xs text-sky-200 mt-1">{inspectedSticker.tagline}</p>
              <button
                onClick={() => {
                  handleStickToggle(inspectedSticker);
                  setInspectedSticker(null);
                }}
                className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-sky-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {inspectedSticker.isStuckOnAlbum ? "Retirer de la page" : "Coller sur mon carnet polaire ✨"}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-slate-950 font-black text-sm shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            Retour au Jeu sur la Banquise ! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
