import React, { useState } from 'react';
import { ParentStats } from '../types';
import { wordsToReview } from '../data/curriculum';
import { speechRecognitionSupported } from '../audio/speechRecognition';
import { isValidSheetsUrl } from '../sync/sheetsSync';
import {
  AVATARS,
  MAX_PROFILES,
  currentProfile,
  deleteProfileData,
  loadProfilesStore,
  saveProfilesStore,
  switchProfile,
} from '../storage/profiles';

interface ParentSettingsProps {
  stats: ParentStats;
  onChangeCustomWords: (words: string[]) => void;
  onToggleVoice: (enabled: boolean) => void;
  onSyncNow: () => Promise<boolean>;
}

const box = 'bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/80';
const title = 'text-xs font-bold text-slate-300 uppercase tracking-wider mb-2';
const input = 'w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-sm text-white outline-none';

export const ParentSettings: React.FC<ParentSettingsProps> = ({ stats, onChangeCustomWords, onToggleVoice, onSyncNow }) => {
  const [wordsText, setWordsText] = useState(stats.customWords.join('\n'));
  const [wordsSaved, setWordsSaved] = useState(false);
  const [store, setStore] = useState(loadProfilesStore);
  const [newName, setNewName] = useState('');
  const [syncMsg, setSyncMsg] = useState('');
  const current = currentProfile();
  const toReview = wordsToReview(stats.wordReview);

  const updateStore = (next: typeof store) => {
    saveProfilesStore(next);
    setStore(next);
  };

  const addProfile = () => {
    const name = newName.trim();
    if (!name || store.profiles.length >= MAX_PROFILES) return;
    const id = `p${Date.now().toString(36)}`;
    const avatar = AVATARS[store.profiles.length % AVATARS.length];
    updateStore({ ...store, profiles: [...store.profiles, { id, name: name.slice(0, 20), avatar }] });
    setNewName('');
  };

  const renameProfile = (id: string, name: string) =>
    updateStore({ ...store, profiles: store.profiles.map((p) => (p.id === id ? { ...p, name: name.slice(0, 20) } : p)) });

  const cycleAvatar = (id: string) =>
    updateStore({
      ...store,
      profiles: store.profiles.map((p) =>
        p.id === id ? { ...p, avatar: AVATARS[(AVATARS.indexOf(p.avatar) + 1) % AVATARS.length] } : p
      ),
    });

  const removeProfile = (id: string) => {
    if (id === current.id || store.profiles.length <= 1) return;
    if (!window.confirm('Supprimer ce profil et toute sa progression ?')) return;
    deleteProfileData(id);
    updateStore({ ...store, profiles: store.profiles.filter((p) => p.id !== id) });
  };

  const syncNow = async () => {
    setSyncMsg('Envoi…');
    const ok = await onSyncNow();
    setSyncMsg(ok ? '✓ Envoyé ! Regarde ta feuille Google Sheets.' : '✗ Envoi impossible : vérifie l\'URL et la connexion.');
  };

  return (
    <>
      {/* Profils */}
      <div className={box}>
        <h4 className={title}>Profils des enfants</h4>
        <div className="flex flex-col gap-1.5">
          {store.profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <button onClick={() => cycleAvatar(p.id)} className="text-2xl w-10 h-10 rounded-xl bg-slate-900 cursor-pointer" title="Changer l'avatar">
                {p.avatar}
              </button>
              <input className={input} value={p.name} onChange={(e) => renameProfile(p.id, e.target.value)} />
              {p.id === current.id ? (
                <span className="text-[10px] font-bold text-emerald-400 whitespace-nowrap">En jeu</span>
              ) : (
                <>
                  <button onClick={() => switchProfile(p.id)} className="px-2 py-1.5 rounded-lg bg-cyan-700 text-[11px] font-bold cursor-pointer">
                    Jouer
                  </button>
                  <button onClick={() => removeProfile(p.id)} className="px-2 py-1.5 rounded-lg bg-rose-800 text-[11px] font-bold cursor-pointer">
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        {store.profiles.length < MAX_PROFILES && (
          <div className="flex gap-2 mt-2">
            <input className={input} placeholder="Prénom du nouvel enfant" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button onClick={addProfile} className="px-3 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-xs font-bold whitespace-nowrap cursor-pointer">
              + Ajouter
            </button>
          </div>
        )}
      </div>

      {/* Mots de l'école */}
      <div className={box}>
        <h4 className={title}>Mots de la semaine (école)</h4>
        <p className="text-[11px] text-slate-400 mb-2">
          Un mot ou une phrase par ligne. Ils seront proposés en priorité dans les défis.
        </p>
        <textarea
          className={`${input} h-28 font-mono`}
          value={wordsText}
          onChange={(e) => {
            setWordsText(e.target.value);
            setWordsSaved(false);
          }}
          placeholder={'maman\nécole\nLe chat boit du lait.'}
        />
        <button
          onClick={() => {
            onChangeCustomWords(wordsText.split('\n').map((w) => w.trim()).filter(Boolean).slice(0, 60));
            setWordsSaved(true);
          }}
          className="mt-2 w-full py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-xs font-bold cursor-pointer"
        >
          {wordsSaved ? '✓ Mots enregistrés' : 'Enregistrer les mots'}
        </button>
      </div>

      {/* Révisions */}
      <div className={box}>
        <h4 className={title}>Mots à retravailler ({toReview.length})</h4>
        {toReview.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Aucune erreur pour l'instant. Les mots ratés reviendront ici et seront reproposés.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {toReview.map((w) => (
              <span key={w} className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs font-bold text-rose-200">
                {w} <span className="opacity-70">({stats.wordReview[w].errors} ✗)</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Micro */}
      <div className={`${box} flex items-center justify-between gap-3`}>
        <div>
          <h4 className={`${title} mb-0`}>Lecture à voix haute (micro)</h4>
          <p className="text-[11px] text-slate-400">
            {speechRecognitionSupported
              ? "L'enfant lit au micro et le jeu vérifie sa lecture."
              : "Non disponible sur ce navigateur (utilisez Chrome ou Edge)."}
          </p>
        </div>
        <button
          disabled={!speechRecognitionSupported}
          onClick={() => onToggleVoice(!stats.voiceEnabled)}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
            stats.voiceEnabled && speechRecognitionSupported ? 'bg-emerald-600' : 'bg-slate-700 text-slate-300'
          }`}
        >
          {stats.voiceEnabled && speechRecognitionSupported ? 'Activé' : 'Désactivé'}
        </button>
      </div>

      {/* Google Sheets */}
      <div className={box}>
        <h4 className={title}>Suivi dans Google Sheets</h4>
        <p className="text-[11px] text-slate-400 mb-2">
          Collez l'URL de l'application web Apps Script (…/exec) et sa clé. Le code du script est dans le dépôt :
          <span className="font-mono"> apps-script/Code.gs</span>.
        </p>
        <input
          className={input}
          placeholder="https://script.google.com/macros/s/…/exec"
          value={store.settings.sheetsUrl}
          onChange={(e) => updateStore({ ...store, settings: { ...store.settings, sheetsUrl: e.target.value.trim() } })}
        />
        <input
          className={`${input} mt-2`}
          placeholder="Clé secrète (TOKEN du script)"
          value={store.settings.sheetsToken}
          onChange={(e) => updateStore({ ...store, settings: { ...store.settings, sheetsToken: e.target.value.trim() } })}
        />
        <button
          disabled={!isValidSheetsUrl(store.settings.sheetsUrl)}
          onClick={syncNow}
          className="mt-2 w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-xs font-bold cursor-pointer"
        >
          Envoyer maintenant
        </button>
        {syncMsg && <p className="text-[11px] text-slate-300 mt-1.5">{syncMsg}</p>}
      </div>
    </>
  );
};
