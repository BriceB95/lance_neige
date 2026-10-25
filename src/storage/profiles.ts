export interface Profile {
  id: string;
  name: string;
  avatar: string;
}

export interface FamilySettings {
  sheetsUrl: string; // URL de l'application web Apps Script
  sheetsToken: string; // clé partagée avec le script
}

interface ProfilesStore {
  profiles: Profile[];
  currentId: string;
  settings: FamilySettings;
}

const KEY = 'roboneige_profiles_v1';
const CHOSEN_KEY = 'roboneige_profile_chosen';
export const AVATARS = ['🧒', '👧', '👦', '🧑‍🚀', '🦸', '🐧', '🦊', '🐻‍❄️'];
export const MAX_PROFILES = 6;

const DEFAULT_STORE: ProfilesStore = {
  profiles: [{ id: 'p1', name: 'Joueur 1', avatar: '🧒' }],
  currentId: 'p1',
  settings: { sheetsUrl: '', sheetsToken: '' },
};

export function loadProfilesStore(): ProfilesStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const store = { ...DEFAULT_STORE, ...JSON.parse(raw) } as ProfilesStore;
      store.settings = { ...DEFAULT_STORE.settings, ...store.settings };
      if (!store.profiles.length) store.profiles = DEFAULT_STORE.profiles;
      if (!store.profiles.some((p) => p.id === store.currentId)) store.currentId = store.profiles[0].id;
      return store;
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return DEFAULT_STORE;
}

export function saveProfilesStore(store: ProfilesStore): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

// Profil actif figé au chargement : changer de profil recharge la page
const CURRENT_ID = loadProfilesStore().currentId;

export function currentProfile(): Profile {
  const store = loadProfilesStore();
  return store.profiles.find((p) => p.id === CURRENT_ID) ?? store.profiles[0];
}

/** Clé de sauvegarde propre au profil (le 1er profil garde les anciennes clés) */
export function profileKey(base: string, id = CURRENT_ID): string {
  return id === 'p1' ? base : `${base}__${id}`;
}

export function switchProfile(id: string): void {
  const store = loadProfilesStore();
  store.currentId = id;
  saveProfilesStore(store);
  markProfileChosen();
  window.location.reload();
}

export function needsProfileChoice(): boolean {
  try {
    return loadProfilesStore().profiles.length > 1 && !sessionStorage.getItem(CHOSEN_KEY);
  } catch {
    return false;
  }
}

export function markProfileChosen(): void {
  try {
    sessionStorage.setItem(CHOSEN_KEY, '1');
  } catch {
    // stockage indisponible : le choix sera redemandé
  }
}

/** Supprime toutes les données d'un profil */
export function deleteProfileData(id: string): void {
  try {
    const suffix = `__${id}`;
    Object.keys(localStorage)
      .filter((k) => k.startsWith('roboneige_') && (id === 'p1' ? !k.includes('__') && k !== KEY : k.endsWith(suffix)))
      .forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('Reset error:', e);
  }
}
