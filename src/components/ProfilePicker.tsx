import React from 'react';
import { currentProfile, loadProfilesStore, markProfileChosen, switchProfile } from '../storage/profiles';

interface ProfilePickerProps {
  visible: boolean;
  onClose: () => void;
}

/** Écran « Qui joue ? » quand plusieurs enfants partagent l'appareil */
export const ProfilePicker: React.FC<ProfilePickerProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  const { profiles } = loadProfilesStore();
  const current = currentProfile();

  const choose = (id: string) => {
    if (id === current.id) {
      markProfileChosen();
      onClose();
    } else {
      switchProfile(id);
    }
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-sky-950/95 backdrop-blur-md select-none">
      <div className="w-full max-w-lg text-center text-white">
        <h2 className="text-3xl font-black mb-6">Qui joue ? 🤖</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => choose(p.id)}
              className={`p-4 rounded-3xl border-4 flex flex-col items-center gap-2 active:scale-95 transition-transform cursor-pointer ${
                p.id === current.id ? 'bg-sky-700 border-amber-300' : 'bg-sky-900 border-sky-500 hover:border-amber-300'
              }`}
            >
              <span className="text-6xl">{p.avatar}</span>
              <span className="font-black text-lg">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
