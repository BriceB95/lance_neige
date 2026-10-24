import React, { useState } from 'react';
import { X, ShieldCheck, BookOpen, PenTool, Award, Clock, Target, AlertTriangle, RefreshCw } from 'lucide-react';
import { ParentStats, DifficultyLevel } from '../types';

interface ParentPortalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ParentStats;
  onUpdateLevel: (level: DifficultyLevel) => void;
  onResetData: () => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateLevel,
  onResetData,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Security gate: simple math problem
  const num1 = 4;
  const num2 = 3;
  const expectedAnswer = num1 * num2; // 12

  if (!isOpen) return null;

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(gateAnswer, 10) === expectedAnswer) {
      setIsUnlocked(true);
      setGateError(false);
    } else {
      setGateError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 rounded-3xl border-3 border-sky-400/50 shadow-2xl p-5 text-slate-100 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isUnlocked ? (
          /* Parent Gate Question */
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400 text-sky-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Espace Parents</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-5">
              Veuillez résoudre ce petit calcul pour accéder au suivi des progrès pédagogiques de votre enfant :
            </p>

            <form onSubmit={handleVerifyGate} className="max-w-xs mx-auto flex flex-col gap-3">
              <div className="text-lg font-bold bg-slate-800 py-3 rounded-xl border border-slate-700 text-amber-300">
                Combien font {num1} × {num2} ?
              </div>
              <input
                type="number"
                value={gateAnswer}
                onChange={(e) => setGateAnswer(e.target.value)}
                placeholder="Votre réponse"
                className="w-full text-center text-lg font-bold py-2.5 rounded-xl bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 text-white outline-none"
                autoFocus
              />
              {gateError && (
                <span className="text-xs text-rose-400 font-semibold">
                  Réponse incorrecte, réessayez.
                </span>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-sm text-white shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Valider et ouvrir le tableau de bord
              </button>
            </form>
          </div>
        ) : (
          /* Parent Dashboard Content */
          <div className="flex flex-col gap-4">
            <div className="border-b border-slate-800 pb-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Accès autorisé
              </div>
              <h2 className="text-2xl font-black text-white">Suivi Pédagogique (CP / CE1)</h2>
              <p className="text-xs text-slate-400">
                Statistiques d'apprentissage de la lecture, de l'écriture et de la motricité.
              </p>
            </div>

            {/* Key KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex flex-col">
                <div className="flex items-center gap-1 text-sky-400 text-xs font-bold mb-1">
                  <BookOpen className="w-4 h-4" /> Mots Lus
                </div>
                <span className="text-2xl font-black text-white">{stats.wordsReadCount}</span>
                <span className="text-[10px] text-slate-400">Déchiffrés avec succès</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex flex-col">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-1">
                  <PenTool className="w-4 h-4" /> Mots Écrits
                </div>
                <span className="text-2xl font-black text-white">{stats.wordsWrittenCount}</span>
                <span className="text-[10px] text-slate-400">Lettres assemblées</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex flex-col">
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mb-1">
                  <Target className="w-4 h-4" /> Précision
                </div>
                <span className="text-2xl font-black text-white">{stats.accuracyRate}%</span>
                <span className="text-[10px] text-slate-400">Taux de réussite</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex flex-col">
                <div className="flex items-center gap-1 text-indigo-400 text-xs font-bold mb-1">
                  <Clock className="w-4 h-4" /> Temps
                </div>
                <span className="text-2xl font-black text-white">{stats.totalPlayTimeMinutes} min</span>
                <span className="text-[10px] text-slate-400">Temps d'activité</span>
              </div>
            </div>

            {/* Curriculum Difficulty Selector */}
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/80">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Niveau Scolaire Recommandé
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cp1', label: 'CP Début', desc: 'Syllabes simples (RO-BOT, NEI-GE)' },
                  { id: 'cp2', label: 'CP Fin', desc: 'Sons complexes (OU, OI, ÉTOILE)' },
                  { id: 'ce1', label: 'CE1', desc: 'Phrases & Orthographe (CHÂTEAU)' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => onUpdateLevel(lvl.id as DifficultyLevel)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      stats.currentLevel === lvl.id
                        ? 'bg-cyan-950 border-cyan-400 shadow-md text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-bold text-xs text-cyan-300">{lvl.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mastered Words Tags */}
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/80">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Mots Débloqués par l'Enfant</span>
                <span className="text-xs text-sky-400 font-normal">
                  {stats.masteredWords.length} mot(s)
                </span>
              </h4>
              {stats.masteredWords.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Aucun mot débloqué pour l'instant. Votre enfant débloquera des mots dans l'Atelier !
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {stats.masteredWords.map((word, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-cyan-900/60 border border-cyan-500/40 text-xs font-extrabold text-cyan-200"
                    >
                      {word} ✓
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Parental Pedagogy Tips */}
            <div className="bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-700/50 text-xs text-indigo-200">
              <span className="font-bold text-amber-300 block mb-1">
                Conseil pour les 7 ans (CP / CE1) :
              </span>
              Invitez votre enfant à répéter chaque mot à voix haute. La synthèse vocale intégrée lui permet de s'auto-corriger en toute autonomie sans frustration !
            </div>

            {/* Danger Zone: Reset */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              {!showConfirmReset ? (
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Réinitialiser la progression
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-bold">Confirmer ?</span>
                  <button
                    onClick={() => {
                      onResetData();
                      setShowConfirmReset(false);
                      setIsUnlocked(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Oui, effacer
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-2 py-1 rounded-lg bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
