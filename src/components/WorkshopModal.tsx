import React, { useState } from 'react';
import { X, Wrench, Lock, CheckCircle, Zap } from 'lucide-react';
import { CurriculumItem, DifficultyLevel, UpgradeCategory, UpgradeItem } from '../types';
import { CATEGORIES, describeBonus, tierMinLevel } from '../data/upgrades';
import { pickChallenges } from '../data/curriculum';
import { ChallengeRunner, ChallengeResult } from './ChallengeRunner';

interface WorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  upgrades: UpgradeItem[];
  power: number;
  gameLevel: number;
  nextGate: { level: number; required: number } | null;
  difficulty: DifficultyLevel;
  masteredWords: string[];
  onUnlockUpgrade: (upgradeId: string, results: ChallengeResult[]) => void;
  onEquipUpgrade: (upgradeId: string) => void;
  onAnswer: (correct: boolean) => void;
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
  onUnlockUpgrade,
  onEquipUpgrade,
  onAnswer,
}) => {
  const [category, setCategory] = useState<UpgradeCategory>('canon');
  const [challenge, setChallenge] = useState<{ upgrade: UpgradeItem; items: CurriculumItem[]; key: number } | null>(null);

  if (!isOpen) return null;

  const startChallenge = (upgrade: UpgradeItem) => {
    setChallenge({ upgrade, items: pickChallenges(difficulty, upgrade.challenges, masteredWords), key: Date.now() });
  };

  const unlockedCount = upgrades.filter((u) => u.unlocked).length;
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
            upgrade={challenge.upgrade}
            items={challenge.items}
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
                const done = total.filter((u) => u.unlocked).length;
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
                      {done}/{total.length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {visible.map((u) => {
                const minLevel = tierMinLevel(u.tier);
                const levelLocked = gameLevel < minLevel;
                return (
                  <div
                    key={u.id}
                    className={`p-3 rounded-2xl border-2 flex flex-col gap-2 ${
                      u.unlocked
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
                        <p className="text-[11px] text-sky-200 leading-snug">{u.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-400/30">
                            {describeBonus(u)}
                          </span>
                          <span className="text-[10px] font-semibold text-yellow-200 bg-yellow-900/40 px-1.5 py-0.5 rounded">
                            ⚡ +{u.power}
                          </span>
                        </div>
                      </div>
                    </div>

                    {u.unlocked ? (
                      u.paint !== undefined || u.crown ? (
                        <button
                          onClick={() => onEquipUpgrade(u.id)}
                          className={`w-full py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                            u.equipped ? 'bg-emerald-500 text-white' : 'bg-cyan-500 hover:bg-cyan-400 text-sky-950'
                          }`}
                        >
                          {u.equipped ? 'Porté par le robot ✓' : 'Mettre sur le robot'}
                        </button>
                      ) : (
                        <div className="w-full py-1.5 rounded-xl font-bold text-xs text-center bg-emerald-600/40 text-emerald-100">
                          Installé sur le robot ✓
                        </div>
                      )
                    ) : levelLocked ? (
                      <div className="w-full py-1.5 rounded-xl font-bold text-xs text-center bg-slate-800 text-slate-300 flex items-center justify-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Disponible au niveau {minLevel}
                      </div>
                    ) : (
                      <button
                        onClick={() => startChallenge(u)}
                        className="w-full py-2 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-slate-950 active:scale-95 transition-all cursor-pointer"
                      >
                        Débloquer : {u.challenges} défi{u.challenges > 1 ? 's' : ''} 📖✍️
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
