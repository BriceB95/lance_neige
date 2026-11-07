import React, { useState } from 'react';
import { X, Wrench, Lock, CheckCircle, Zap } from 'lucide-react';
import { CurriculumItem, DifficultyLevel, ReviewEntry, UpgradeCategory, UpgradeItem } from '../types';
import { CATEGORIES, describeBonus, maxRank, rankChallenges, rankMinLevel, rankPower } from '../data/upgrades';
import { isHardLevel, pickChallenges } from '../data/curriculum';
import { ChallengeMode, ChallengeRunner, ChallengeResult } from './ChallengeRunner';

interface WorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  upgrades: UpgradeItem[];
  power: number;
  gameLevel: number;
  nextGate: { level: number; required: number } | null;
  difficulty: DifficultyLevel;
  masteredWords: string[];
  customItems: CurriculumItem[];
  review: Record<string, ReviewEntry>;
  voiceEnabled: boolean;
  onUnlockUpgrade: (upgradeId: string, results: ChallengeResult[]) => void;
  onEquipUpgrade: (upgradeId: string) => void;
  onAnswer: (correct: boolean, item: CurriculumItem, mode: ChallengeMode) => void;
}

export const WorkshopModal: React.FC<WorkshopModalProps> = ({
  isOpen,
  onClose,
  upgrades,
  power,
  gameLevel,
  nextGate,
  difficulty,
  masteredWords,
  customItems,
  review,
  voiceEnabled,
  onUnlockUpgrade,
  onEquipUpgrade,
  onAnswer,
}) => {
  const [category, setCategory] = useState<UpgradeCategory>('canon');
  const [challenge, setChallenge] = useState<{ upgrade: UpgradeItem; items: CurriculumItem[]; key: number } | null>(null);

  if (!isOpen) return null;

  const startChallenge = (upgrade: UpgradeItem) => {
    setChallenge({
      upgrade,
      items: pickChallenges(difficulty, rankChallenges(upgrade, upgrade.rank + 1), masteredWords, { custom: customItems, review }),
      key: Date.now(),
    });
  };

  const unlockedCount = upgrades.filter((u) => u.unlocked).length;
  const starsEarned = upgrades.reduce((sum, u) => sum + u.rank, 0);
  const starsTotal = upgrades.reduce((sum, u) => sum + maxRank(u), 0);
  const stars = (u: UpgradeItem) => '★'.repeat(u.rank) + '☆'.repeat(maxRank(u) - u.rank);
  const visible = upgrades.filter((u) => u.category === category).sort((a, b) => a.tier - b.tier);
  const gateMissing = nextGate ? Math.max(0, nextGate.required - power) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-sky-900 to-indigo-950 rounded-3xl border-4 border-amber-300 shadow-2xl p-4 sm:p-5 text-white max-h-[94vh] overflow-y-auto flex flex-col gap-3">
        <button
          onClick={() => {
            setChallenge(null);
            onClose();
          }}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center pr-8 sm:pr-0">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-300/40 text-amber-300 font-bold text-xs mb-1">
            <Wrench className="w-4 h-4" />
            Atelier de l'Inventeur Polaire
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold">Améliore ton Robot en lisant !</h2>
        </div>

        {/* Puissance du robot */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span className="flex items-center gap-1 bg-amber-400 text-slate-950 px-3 py-1.5 rounded-full">
            <Zap className="w-4 h-4" /> Puissance {power}
          </span>
          <span className="bg-sky-800/80 px-3 py-1.5 rounded-full border border-sky-500/50">
            🔧 {unlockedCount} / {upgrades.length} améliorations
          </span>
          <span className="bg-sky-800/80 px-3 py-1.5 rounded-full border border-sky-500/50 text-yellow-200">
            ★ {starsEarned} / {starsTotal} étoiles
          </span>
          {nextGate && (
            <span
              className={`px-3 py-1.5 rounded-full border ${
                gateMissing > 0 ? 'bg-rose-900/70 border-rose-400 text-rose-100' : 'bg-emerald-900/70 border-emerald-400 text-emerald-100'
              }`}
            >
              🚧 Niveau {nextGate.level} : ⚡ {nextGate.required}
              {gateMissing > 0 ? ` (il manque ${gateMissing})` : ' ✓'}
            </span>
          )}
        </div>

        {challenge ? (
          <ChallengeRunner
            key={challenge.key}
            title={challenge.upgrade.name}
            icon={challenge.upgrade.icon}
            items={challenge.items}
            pool={customItems}
            voiceEnabled={voiceEnabled}
            hard={isHardLevel(difficulty)}
            successMessage={
              challenge.upgrade.rank === 0
                ? `Bravo ! ${challenge.upgrade.name} est débloqué !`
                : `Bravo ! ${challenge.upgrade.name} passe à ${'★'.repeat(challenge.upgrade.rank + 1)} !`
            }
            onAnswer={onAnswer}
            onCancel={() => setChallenge(null)}
            onComplete={(results) => {
              onUnlockUpgrade(challenge.upgrade.id, results);
              setChallenge(null);
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {CATEGORIES.map((c) => {
                const total = upgrades.filter((u) => u.category === c.id);
                const done = total.reduce((sum, u) => sum + u.rank, 0);
                const max = total.reduce((sum, u) => sum + maxRank(u), 0);
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`py-1.5 rounded-xl text-xs font-bold flex flex-col items-center cursor-pointer transition-colors ${
                      category === c.id ? 'bg-cyan-500 text-sky-950' : 'bg-slate-900/60 text-sky-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-lg leading-none">{c.icon}</span>
                    {c.label}
                    <span className="text-[10px] opacity-80">
                      ★ {done}/{max}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {visible.map((u) => {
                const nextRank = u.rank + 1;
                const canRankUp = nextRank <= maxRank(u);
                const minLevel = canRankUp ? rankMinLevel(u, nextRank) : 0;
                const levelLocked = canRankUp && gameLevel < minLevel;
                const needed = canRankUp ? rankChallenges(u, nextRank) : 0;
                const isLook = u.paint !== undefined || u.crown;
                return (
                  <div
                    key={u.id}
                    className={`p-3 rounded-2xl border-2 flex flex-col gap-2 ${
                      u.rank >= maxRank(u)
                        ? 'bg-amber-900/30 border-amber-300'
                        : u.unlocked
                        ? 'bg-sky-800/60 border-cyan-400'
                        : levelLocked
                        ? 'bg-slate-900/60 border-slate-700 opacity-60'
                        : 'bg-indigo-950/80 border-indigo-600 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="text-3xl p-1.5 rounded-xl bg-white/10 border border-white/20">{u.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className="font-bold text-sm">{u.name}</h3>
                          {u.unlocked && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                        <div className="text-yellow-300 text-sm leading-none tracking-widest">{stars(u)}</div>
                        <p className="text-[11px] text-sky-200 leading-snug mt-0.5">{u.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-400/30">
                            {describeBonus(u)}
                            {!isLook && u.rank >= 2 && Object.keys(u.stats).some((k) => k !== 'multishot') && ` (×${u.rank === 2 ? '1,6' : '2,2'})`}
                          </span>
                          <span className="text-[10px] font-semibold text-yellow-200 bg-yellow-900/40 px-1.5 py-0.5 rounded">
                            ⚡ {u.rank > 0 ? rankPower(u, u.rank) : `+${u.power}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {u.unlocked && isLook && (
                      <button
                        onClick={() => onEquipUpgrade(u.id)}
                        className={`w-full py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                          u.equipped ? 'bg-emerald-500 text-white' : 'bg-cyan-500 hover:bg-cyan-400 text-sky-950'
                        }`}
                      >
                        {u.equipped ? 'Porté par le robot ✓' : 'Mettre sur le robot'}
                      </button>
                    )}
                    {!canRankUp ? (
                      !isLook && (
                        <div className="w-full py-1.5 rounded-xl font-bold text-xs text-center bg-amber-500/30 text-amber-100">
                          Maximum atteint ★★★
                        </div>
                      )
                    ) : levelLocked ? (
                      <div className="w-full py-1.5 rounded-xl font-bold text-xs text-center bg-slate-800 text-slate-300 flex items-center justify-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> {u.rank === 0 ? 'Disponible' : `${'★'.repeat(nextRank)} disponible`} au niveau {minLevel}
                      </div>
                    ) : (
                      <button
                        onClick={() => startChallenge(u)}
                        className="w-full py-2 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-slate-950 active:scale-95 transition-all cursor-pointer"
                      >
                        {u.rank === 0 ? 'Débloquer' : `Passer à ${'★'.repeat(nextRank)}`} : {needed} défi{needed > 1 ? 's' : ''} 📖✍️
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
