import React from 'react';
import { Snowflake, Heart, Award, Wrench, Shield, Volume2, Sparkles, Mountain } from 'lucide-react';
import { speakFrench } from '../audio/soundEffects';
import { LevelProgress, TerrainTheme } from '../types';

interface HUDProps {
  snowAmmo: number;
  maxSnow: number;
  health: number;
  maxHealth: number;
  power: number;
  score: number;
  stars: number;
  terrainTheme: TerrainTheme;
  onChangeTerrainTheme: (theme: TerrainTheme) => void;
  onOpenWorkshop: () => void;
  onOpenRewards: () => void;
  onOpenParentPortal: () => void;
  activeMissionHint: string;
  levelProgress: LevelProgress | null;
  timeLeftLabel: string;
  timeLow: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  snowAmmo,
  maxSnow,
  health,
  maxHealth,
  power,
  score,
  terrainTheme,
  onChangeTerrainTheme,
  onOpenWorkshop,
  onOpenRewards,
  onOpenParentPortal,
  activeMissionHint,
  levelProgress,
  timeLeftLabel,
  timeLow,
}) => {
  const snowPercent = Math.min(100, Math.round((snowAmmo / maxSnow) * 100));
  const healthPercent = Math.min(100, Math.round((health / maxHealth) * 100));

  const handleSpeakHint = () => {
    speakFrench(activeMissionHint);
  };

  const handleCycleTerrain = () => {
    const nextTheme: TerrainTheme =
      terrainTheme === 'snow-forest'
        ? 'ice-plain'
        : terrainTheme === 'ice-plain'
        ? 'crystal-valley'
        : 'snow-forest';

    onChangeTerrainTheme(nextTheme);

    const announce =
      nextTheme === 'snow-forest'
        ? 'Bienvenue dans la Forêt Enneigée !'
        : nextTheme === 'ice-plain'
        ? 'Attention aux glissades sur la Plaine Glacée !'
        : 'Regarde les beaux cristaux magiques !';
    speakFrench(announce);
  };

  const themeLabel =
    terrainTheme === 'snow-forest'
      ? '🌲 Forêt'
      : terrainTheme === 'ice-plain'
      ? '⛸️ Glace'
      : '✨ Cristaux';

  return (
    <header className="absolute inset-x-0 top-0 p-3 pointer-events-none z-30 flex flex-col gap-2 select-none">
      {/* Top Bar */}
      <div className="flex justify-between items-start gap-2">
        {/* Left: Snow Ammo Tank & Health Bar */}
        <div className="pointer-events-auto flex flex-col gap-1.5 bg-sky-950/80 backdrop-blur-md p-2.5 rounded-2xl border-2 border-sky-400/60 shadow-lg min-w-[170px] max-w-[210px]">
          {/* Snow Tank Gauge */}
          <div className="flex items-center justify-between text-xs font-bold text-sky-200">
            <span className="flex items-center gap-1 text-cyan-300">
              <Snowflake className="w-4 h-4 animate-spin-slow text-white" />
              Neige
            </span>
            <span className="font-extrabold text-white text-xs">
              {snowAmmo}/{maxSnow}
            </span>
          </div>
          <div className="w-full h-3 bg-sky-900 rounded-full overflow-hidden p-0.5 border border-sky-600">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-white rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${snowPercent}%` }}
            />
          </div>

          {/* Health Bar */}
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-300 mt-0.5">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              Énergie
            </span>
            <span>{healthPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* Center: Score & Stars Badge */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-3 bg-sky-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-amber-300/60 shadow-lg">
          <div className="flex items-center gap-1.5 text-amber-300 font-black text-lg">
            <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            <span>{score} pts</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-200 font-black text-sm" title="Puissance du robot">
            ⚡ {power}
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Terrain Biome Cycle Button */}
          <button
            onClick={handleCycleTerrain}
            className="flex items-center gap-1 px-2.5 py-2 rounded-2xl bg-sky-900/90 hover:bg-sky-800 border-2 border-cyan-300 text-white font-bold text-xs shadow-lg active:scale-90 transition-transform cursor-pointer"
            title="Changer le paysage arctique"
          >
            <Mountain className="w-3.5 h-3.5 text-cyan-300" />
            <span>{themeLabel}</span>
          </button>

          {/* Workshop Button */}
          <button
            onClick={onOpenWorkshop}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-xl active:scale-90 transition-transform border-2 border-white cursor-pointer relative"
            title="Atelier des Améliorations"
          >
            <Wrench className="w-4 h-4 text-slate-950" />
            <span className="hidden xs:inline">Atelier</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white absolute -top-1 -right-1" />
          </button>

          {/* Rewards / Trophies Button */}
          <button
            onClick={onOpenRewards}
            className="w-10 h-10 rounded-2xl bg-sky-900/90 hover:bg-sky-800 border-2 border-sky-300 text-amber-300 flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
            title="Trophées & Badges"
          >
            <Award className="w-5 h-5" />
          </button>

          {/* Parent Portal Button */}
          <button
            onClick={onOpenParentPortal}
            className="w-10 h-10 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border-2 border-slate-500 text-slate-200 flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
            title="Espace Parents (Protégé)"
          >
            <Shield className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Level Progress */}
      {levelProgress && (
        <div className="pointer-events-none self-center flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-indigo-950/85 backdrop-blur-md px-4 py-1.5 rounded-2xl border-2 border-amber-300/70 shadow-md text-xs font-black text-white">
          <span className="text-amber-300">Niveau {levelProgress.level}</span>
          <span className="text-yellow-200 sm:hidden">⚡ {power}</span>
          <span className={timeLow ? 'text-rose-300 animate-pulse' : 'text-sky-200'} title="Temps de jeu restant aujourd'hui">
            ⏳ {timeLeftLabel}
          </span>
          <span>⛄ {levelProgress.killed}/{levelProgress.total}</span>
          {levelProgress.mode === 'defend' && (
            <>
              <span>⏱️ {levelProgress.timeLeft}s</span>
              <span className="flex items-center gap-1">
                🏰
                <span className="w-16 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-600 inline-block">
                  <span
                    className="block h-full bg-gradient-to-r from-emerald-400 to-lime-300 transition-all duration-300"
                    style={{
                      width: `${Math.round((levelProgress.castleHp / Math.max(1, levelProgress.castleMaxHp)) * 100)}%`,
                    }}
                  />
                </span>
              </span>
            </>
          )}
        </div>
      )}

      {/* Helpful Audio-Assisted Mission Prompt */}
      <div className="pointer-events-auto self-center flex items-center gap-2 bg-sky-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-400/50 shadow-md max-w-md">
        <span className="text-xs text-sky-100 font-bold leading-tight">
          {activeMissionHint}
        </span>
        <button
          onClick={handleSpeakHint}
          className="text-cyan-300 hover:text-white p-1 rounded-full active:scale-90 transition-transform cursor-pointer"
          title="Écouter la consigne"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
