import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle, Sparkles, X, Wrench, Lock, ArrowRight, RotateCcw } from 'lucide-react';
import { UpgradeItem, CurriculumItem } from '../types';
import { speakFrench, playSuccessChime, playUpgradeUnlock } from '../audio/soundEffects';

interface WorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  upgrades: UpgradeItem[];
  onUnlockUpgrade: (upgradeId: string, word: string, mode: 'read' | 'write') => void;
  onEquipUpgrade: (upgradeId: string) => void;
  snowCollected: number;
}

export const WorkshopModal: React.FC<WorkshopModalProps> = ({
  isOpen,
  onClose,
  upgrades,
  onUnlockUpgrade,
  onEquipUpgrade,
  snowCollected,
}) => {
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeItem | null>(null);
  const [challengeMode, setChallengeMode] = useState<'read' | 'write'>('read');
  const [writtenLetters, setWrittenLetters] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ isSuccess: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  const handleSelectUpgrade = (upgrade: UpgradeItem) => {
    setSelectedUpgrade(upgrade);
    setWrittenLetters([]);
    setFeedback(null);
    setChallengeMode(upgrade.challengeRequired.type === 'sentence' ? 'read' : 'write');
  };

  const currentChallenge = selectedUpgrade?.challengeRequired;

  const handleSyllableClick = (syl: string) => {
    speakFrench(syl);
  };

  const handleFullSpeak = () => {
    if (currentChallenge) {
      speakFrench(currentChallenge.content);
    }
  };

  const handleAddLetter = (letter: string, index: number) => {
    if (!currentChallenge || !currentChallenge.scrambled) return;
    setWrittenLetters(prev => [...prev, letter]);
    speakFrench(letter);
  };

  const handleRemoveLetter = (index: number) => {
    setWrittenLetters(prev => prev.filter((_, i) => i !== index));
  };

  const handleResetLetters = () => {
    setWrittenLetters([]);
    setFeedback(null);
  };

  const handleValidateReading = () => {
    if (!selectedUpgrade || !currentChallenge) return;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    playSuccessChime();
    playUpgradeUnlock();

    setFeedback({
      isSuccess: true,
      msg: '🎉 Bravo petit champion ! Tu as lu comme un chef !',
    });
    speakFrench(`Bravo ! Tu as débloqué ${selectedUpgrade.name} !`);

    setTimeout(() => {
      onUnlockUpgrade(selectedUpgrade.id, currentChallenge.content, 'read');
      setSelectedUpgrade(null);
    }, 1600);
  };

  const handleValidateWriting = () => {
    if (!selectedUpgrade || !currentChallenge) return;
    const formedWord = writtenLetters.join('');
    const targetWord = currentChallenge.content.replace(/\s+/g, '').toUpperCase();

    if (formedWord.toUpperCase() === targetWord) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      playSuccessChime();
      playUpgradeUnlock();

      setFeedback({
        isSuccess: true,
        msg: '⭐ Merveilleux ! Mot parfaitement orthographié !',
      });
      speakFrench(`Félicitations ! Le mot ${currentChallenge.content} est parfait !`);

      setTimeout(() => {
        onUnlockUpgrade(selectedUpgrade.id, currentChallenge.content, 'write');
        setSelectedUpgrade(null);
      }, 1600);
    } else {
      setFeedback({
        isSuccess: false,
        msg: 'Oups, ce n\'est pas tout à fait ça. Réessaye doucement !',
      });
      speakFrench("Réessaye doucement, tu peux y arriver !");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-sky-900 to-indigo-950 rounded-3xl border-4 border-amber-300 shadow-2xl p-5 text-white max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 px-4 py-1.5 rounded-full border border-amber-300/40 text-amber-300 font-bold text-sm mb-1">
            <Wrench className="w-4 h-4" />
            Atelier de l'Inventeur Polaire
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-sky-200 drop-shadow">
            Améliore ton Robot !
          </h2>
          <p className="text-xs sm:text-sm text-sky-200 mt-1">
            Lis ou écris des mots magiques pour débloquer de super pouvoirs ! ❄️
          </p>
        </div>

        {/* Main Content: List or Challenge */}
        {!selectedUpgrade ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            {upgrades.map((upgrade) => {
              const isEquipped = upgrade.equipped;
              const isUnlocked = upgrade.unlocked;

              return (
                <div
                  key={upgrade.id}
                  className={`p-4 rounded-2xl border-3 flex flex-col justify-between transition-all ${
                    isUnlocked
                      ? 'bg-sky-800/60 border-cyan-400 shadow-md'
                      : 'bg-indigo-950/80 border-indigo-700/80 hover:border-amber-400/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl p-2 rounded-2xl bg-white/10 border border-white/20">
                      {upgrade.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-white">{upgrade.name}</h3>
                        {isUnlocked && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-sky-200 mt-0.5 leading-snug">
                        {upgrade.description}
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-400/30">
                        {upgrade.bonus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                    {isUnlocked ? (
                      <button
                        onClick={() => onEquipUpgrade(upgrade.id)}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-emerald-500 text-white shadow-inner'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-sky-950'
                        }`}
                      >
                        {isEquipped ? 'Équipé sur le Robot ✓' : 'Équiper maintenant'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectUpgrade(upgrade)}
                        className="w-full py-2.5 px-3 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-slate-950 shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        Débloquer le défi lecture / écriture
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Challenge Screen */
          <div className="bg-sky-950/90 rounded-2xl p-5 border-2 border-sky-400/60 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-sky-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{selectedUpgrade.icon}</span>
                <div>
                  <h3 className="font-extrabold text-lg text-amber-300">
                    Défi : {selectedUpgrade.name}
                  </h3>
                  <p className="text-xs text-sky-200">
                    Niveau : {currentChallenge?.level.toUpperCase()} • Catégorie : {currentChallenge?.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUpgrade(null)}
                className="text-xs font-bold text-sky-300 hover:text-white underline cursor-pointer"
              >
                Retour à la liste
              </button>
            </div>

            {/* Hint & Speech */}
            <div className="flex items-center justify-between bg-sky-900/60 p-3 rounded-xl border border-sky-600/40">
              <div className="flex-1 pr-2">
                <p className="text-xs text-amber-200 font-medium">
                  💡 Indice : {currentChallenge?.hint}
                </p>
              </div>
              <button
                onClick={handleFullSpeak}
                className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 rounded-lg text-xs font-bold shadow active:scale-90 transition-transform cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                Écouter
              </button>
            </div>

            {/* Mode selection tabs if word */}
            {currentChallenge?.type === 'word' && (
              <div className="flex rounded-xl bg-slate-900/60 p-1 border border-slate-700">
                <button
                  onClick={() => setChallengeMode('read')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    challengeMode === 'read' ? 'bg-cyan-500 text-sky-950' : 'text-sky-300'
                  }`}
                >
                  📖 Défi Lecture (Syllabes)
                </button>
                <button
                  onClick={() => setChallengeMode('write')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    challengeMode === 'write' ? 'bg-cyan-500 text-sky-950' : 'text-sky-300'
                  }`}
                >
                  ✍️ Défi Écriture (Assembler)
                </button>
              </div>
            )}

            {/* READING MODE */}
            {challengeMode === 'read' && currentChallenge && (
              <div className="text-center py-4">
                <p className="text-xs text-sky-300 mb-2 font-semibold">
                  Touche chaque syllabe pour entendre le son, puis lis le mot tout seul !
                </p>

                {currentChallenge.syllables ? (
                  <div className="flex justify-center gap-3 my-4">
                    {currentChallenge.syllables.map((syl, i) => (
                      <button
                        key={i}
                        onClick={() => handleSyllableClick(syl)}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 border-3 border-white text-2xl font-black text-white shadow-lg active:scale-95 transition-transform cursor-pointer"
                      >
                        {syl}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="my-4 p-4 rounded-2xl bg-white/10 border-2 border-cyan-400 text-2xl sm:text-3xl font-extrabold tracking-wide">
                    {currentChallenge.content}
                  </div>
                )}

                <p className="text-xs text-sky-200 italic my-2">
                  "{currentChallenge.explanation}"
                </p>

                <button
                  onClick={handleValidateReading}
                  className="mt-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-extrabold text-base shadow-xl flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  J'ai réussi à le lire !
                </button>
              </div>
            )}

            {/* WRITING / SPELLING PUZZLE MODE */}
            {challengeMode === 'write' && currentChallenge && (
              <div className="text-center py-2">
                <p className="text-xs text-sky-300 mb-2 font-semibold">
                  Touche les lettres dans le bon ordre pour écrire le mot !
                </p>

                {/* Slots for written letters */}
                <div className="flex justify-center gap-2 my-3 min-h-[56px] items-center">
                  {Array.from({ length: currentChallenge.content.length }).map((_, idx) => {
                    const letter = writtenLetters[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => letter && handleRemoveLetter(idx)}
                        className={`w-12 h-14 rounded-xl border-3 flex items-center justify-center text-2xl font-black transition-all cursor-pointer ${
                          letter
                            ? 'bg-amber-400 border-amber-200 text-slate-950 shadow-md animate-bounce-subtle'
                            : 'bg-sky-950/50 border-sky-500/50 text-sky-400/40'
                        }`}
                      >
                        {letter || '_'}
                      </div>
                    );
                  })}
                </div>

                {/* Scrambled letter buttons */}
                <div className="flex flex-wrap justify-center gap-2 my-3">
                  {currentChallenge.scrambled?.map((char, index) => {
                    // Check if already used
                    const usedCount = writtenLetters.filter(l => l === char).length;
                    const availableCount = currentChallenge.scrambled!.filter(l => l === char).length;
                    const isAllUsed = usedCount >= availableCount;

                    return (
                      <button
                        key={index}
                        disabled={isAllUsed}
                        onClick={() => handleAddLetter(char, index)}
                        className={`w-12 h-12 rounded-xl text-xl font-black border-2 transition-all cursor-pointer ${
                          isAllUsed
                            ? 'bg-slate-800 border-slate-700 text-slate-600 opacity-40 cursor-not-allowed'
                            : 'bg-cyan-500 hover:bg-cyan-400 border-white text-sky-950 shadow-md active:scale-90'
                        }`}
                      >
                        {char}
                      </button>
                    );
                  })}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-3 mt-3">
                  <button
                    onClick={handleResetLetters}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-sky-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Effacer
                  </button>
                  <button
                    onClick={handleValidateWriting}
                    disabled={writtenLetters.length !== currentChallenge.content.length}
                    className={`px-6 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                      writtenLetters.length === currentChallenge.content.length
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg active:scale-95'
                        : 'bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Vérifier mon mot !
                  </button>
                </div>
              </div>
            )}

            {/* Feedback alert */}
            {feedback && (
              <div
                className={`p-3 rounded-xl text-center font-bold text-sm border-2 animate-fade-in ${
                  feedback.isSuccess
                    ? 'bg-emerald-900/80 border-emerald-400 text-emerald-200'
                    : 'bg-rose-900/80 border-rose-400 text-rose-200'
                }`}
              >
                {feedback.msg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
