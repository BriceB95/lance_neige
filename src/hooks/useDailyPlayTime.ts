import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'roboneige_playtime_v1';

interface PlayTimeRecord {
  date: string; // AAAA-MM-JJ
  seconds: number; // temps joué aujourd'hui
  extraMinutes: number; // minutes ajoutées par le parent aujourd'hui
}

const todayKey = () => new Date().toLocaleDateString('fr-CA');
const freshRecord = (): PlayTimeRecord => ({ date: todayKey(), seconds: 0, extraMinutes: 0 });

function loadRecord(): PlayTimeRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const rec = JSON.parse(raw) as PlayTimeRecord;
      if (rec.date === todayKey()) return rec;
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return freshRecord();
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.ceil(totalSeconds / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

/**
 * Temps de jeu par jour : compte les secondes passées sur l'onglet visible,
 * remis à zéro chaque jour.
 */
export function useDailyPlayTime(limitMinutes: number) {
  const [record, setRecord] = useState<PlayTimeRecord>(loadRecord);
  const limitRef = useRef(limitMinutes);
  limitRef.current = limitMinutes;

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setRecord((prev) => {
        const base = prev.date === todayKey() ? prev : freshRecord();
        if (base.seconds >= (limitRef.current + base.extraMinutes) * 60) return base;
        return { ...base, seconds: base.seconds + 1 };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [record]);

  const remaining = Math.max(0, (limitMinutes + record.extraMinutes) * 60 - record.seconds);

  return {
    usedSeconds: record.seconds,
    remainingSeconds: remaining,
    isOver: remaining <= 0,
    addMinutes: (minutes: number) =>
      setRecord((prev) => {
        const base = prev.date === todayKey() ? prev : freshRecord();
        return { ...base, extraMinutes: base.extraMinutes + minutes };
      }),
  };
}
