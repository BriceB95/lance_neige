import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { VirtualControls } from './components/VirtualControls';
import { HUD } from './components/HUD';
import { WorkshopModal } from './components/WorkshopModal';
import { ParentPortal } from './components/ParentPortal';
import { RewardsModal } from './components/RewardsModal';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { LevelOverlay } from './components/LevelOverlay';
import { getLevelConfig, requiredPowerFor } from './data/levels';
import { computeLook, computePower, computeRobotStats } from './data/upgrades';
import { ChallengeResult } from './components/ChallengeRunner';
import { TimeUpOverlay } from './components/TimeUpOverlay';
import { useDailyPlayTime, formatDuration } from './hooks/useDailyPlayTime';
import { RoboNeigeScene } from './game/threeScene';
import {
  loadPlayerState,
  savePlayerState,
  loadUpgrades,
  saveUpgrades,
  loadParentStats,
  saveParentStats,
  loadTrophies,
  saveTrophies,
  loadStickers,
  saveStickers,
  resetAllData,
} from './storage/gameStorage';
import { PlayerState, UpgradeItem, ParentStats, Trophy, StickerReward, DifficultyLevel, TerrainTheme, LevelProgress } from './types';
import { speakFrench } from './audio/soundEffects';

export default function App() {
  const [playerState, setPlayerState] = useState<PlayerState>(loadPlayerState);
  const [upgrades, setUpgrades] = useState<UpgradeItem[]>(loadUpgrades);
  const [parentStats, setParentStats] = useState<ParentStats>(loadParentStats);
  const [trophies, setTrophies] = useState<Trophy[]>(loadTrophies);
  const [stickers, setStickers] = useState<StickerReward[]>(loadStickers);
  const [celebrationReward, setCelebrationReward] = useState<StickerReward | null>(null);
  const [terrainTheme, setTerrainTheme] = useState<TerrainTheme>('snow-forest');

  // Robot : statistiques, puissance et apparence calculées à partir des améliorations
  const stats = useMemo(() => computeRobotStats(upgrades), [upgrades]);
  const power = useMemo(() => computePower(upgrades), [upgrades]);
  const look = useMemo(() => computeLook(upgrades), [upgrades]);

  // Prochain niveau qui exige une puissance minimale
  const nextGate = useMemo(() => {
    for (let lvl = playerState.gameLevel + 1; lvl <= playerState.gameLevel + 3; lvl++) {
      const required = requiredPowerFor(lvl);
      if (required > 0) return { level: lvl, required };
    }
    return null;
  }, [playerState.gameLevel]);
  const nextLevelRequired = requiredPowerFor(playerState.gameLevel + 1);
  const nextLevelLocked = power < nextLevelRequired;

  // Modal visibility states
  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isParentPortalOpen, setIsParentPortalOpen] = useState(false);

  // Limite de temps de jeu par jour (réglable dans l'Espace Parents)
  const playTime = useDailyPlayTime(parentStats.dailyLimitMinutes);
  const warnedRef = useRef<number | null>(null);
  useEffect(() => {
    const r = playTime.remainingSeconds;
    for (const mark of [600, 60]) {
      if (r <= mark && r > mark - 5 && warnedRef.current !== mark) {
        warnedRef.current = mark;
        const msg = mark === 600 ? 'Plus que 10 minutes de jeu aujourd\'hui !' : 'Plus qu\'une minute de jeu !';
        setMissionHint(`⏳ ${msg}`);
        speakFrench(msg);
      }
    }
  }, [playTime.remainingSeconds]);

  // Level state
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [failReason, setFailReason] = useState<'robot' | 'castle'>('robot');
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null);
  const [initialLevel] = useState(() => getLevelConfig(playerState.gameLevel));

  // Mission prompt for child
  const [missionHint, setMissionHint] = useState<string>(initialLevel.hint);

  const sceneRef = useRef<RoboNeigeScene | null>(null);

  // Stock réel de boules, mis à jour immédiatement à chaque tir (anti tir illimité)
  const ammoRef = useRef(playerState.snowAmmo);
  ammoRef.current = playerState.snowAmmo;

  // Pause du jeu quand une fenêtre est ouverte ou le niveau terminé
  const isPaused =
    playTime.isOver ||
    gameStatus !== 'playing' ||
    isWorkshopOpen ||
    isRewardsOpen ||
    isParentPortalOpen ||
    celebrationReward !== null;

  useEffect(() => {
    sceneRef.current?.setPaused(isPaused);
  }, [isPaused]);

  // Énergie à zéro : niveau perdu
  useEffect(() => {
    if (playerState.health <= 0 && gameStatus === 'playing') {
      setFailReason('robot');
      setGameStatus('lost');
    }
  }, [playerState.health, gameStatus]);

  // Auto-save on state updates
  useEffect(() => {
    savePlayerState(playerState);
  }, [playerState]);

  useEffect(() => {
    saveUpgrades(upgrades);
  }, [upgrades]);

  useEffect(() => {
    saveParentStats(parentStats);
  }, [parentStats]);

  useEffect(() => {
    saveTrophies(trophies);
  }, [trophies]);

  useEffect(() => {
    saveStickers(stickers);
  }, [stickers]);

  // Helper to award a sticker with celebration ceremony
  const triggerRewardUnlock = useCallback((stickerId: string) => {
    setStickers((prev) => {
      const target = prev.find((s) => s.id === stickerId);
      if (!target || target.unlockedAt !== null) return prev;

      const updatedSticker = {
        ...target,
        unlockedAt: Date.now(),
        isStuckOnAlbum: true,
      };

      setCelebrationReward(updatedSticker);

      return prev.map((s) => (s.id === stickerId ? updatedSticker : s));
    });
  }, []);

  // Track playtime periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setParentStats((prev) => ({
        ...prev,
        totalPlayTimeMinutes: prev.totalPlayTimeMinutes + 1,
      }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Check and unlock trophies
  const checkTrophies = useCallback((condition: 'snow' | 'hit' | 'read' | 'write' | 'upgrade' | 'score') => {
    setTrophies((prevTrophies) => {
      let updated = false;
      const next = prevTrophies.map((t) => {
        if (t.unlockedAt !== null) return t;
        let shouldUnlock = false;

        if (t.id === 'trophy-first-snow' && condition === 'snow') shouldUnlock = true;
        if (t.id === 'trophy-first-hit' && condition === 'hit') shouldUnlock = true;
        if (t.id === 'trophy-first-read' && condition === 'read') shouldUnlock = true;
        if (t.id === 'trophy-wordsmith' && condition === 'write' && parentStats.wordsWrittenCount >= 2) shouldUnlock = true;
        if (t.id === 'trophy-custom-bot' && condition === 'upgrade') shouldUnlock = true;
        if (t.id === 'trophy-grand-nord' && playerState.score >= 500) shouldUnlock = true;

        if (shouldUnlock) {
          updated = true;
          return { ...t, unlockedAt: Date.now() };
        }
        return t;
      });
      return updated ? next : prevTrophies;
    });
  }, [parentStats.wordsWrittenCount, playerState.score]);

  // Handler: collect snow from ground
  const handleCollectSnow = (amount: number) => {
    setPlayerState((prev) => {
      const nextSnow = Math.min(stats.maxSnow, prev.snowAmmo + amount);
      return {
        ...prev,
        snowAmmo: nextSnow,
        score: prev.score + 10,
      };
    });

    setParentStats((prev) => {
      const nextCollected = prev.snowCollected + amount;
      if (nextCollected >= 15) {
        triggerRewardUnlock('stk-snow-1');
      }
      return {
        ...prev,
        snowCollected: nextCollected,
      };
    });

    checkTrophies('snow');
    setMissionHint('Super ! Ton réservoir est plein, vise les bonshommes farceurs ! 🎯');
  };

  // Handler: hit snowman enemy
  const handleHitEnemy = (scoreGain: number, isDouble?: boolean) => {
    setPlayerState((prev) => {
      const nextScore = prev.score + scoreGain;
      if (nextScore >= 150) {
        triggerRewardUnlock('stk-snow-2');
      }
      return {
        ...prev,
        score: nextScore,
        stars: prev.stars + (isDouble ? 2 : 1),
      };
    });

    checkTrophies('hit');
    setMissionHint('Touché ! Bravo ! Ouvre l\'Atelier pour améliorer ton robot ! 🤖');
  };

  // Handler: robot takes damage from enemy snowball
  const handleRobotDamaged = (amount: number) => {
    setPlayerState((prev) => ({ ...prev, health: Math.max(0, prev.health - amount) }));
  };

  // Handler: heart pickup (+10% d'énergie)
  const handleCollectHeart = () => {
    setPlayerState((prev) => ({
      ...prev,
      health: Math.min(stats.maxHealth, prev.health + Math.round((stats.maxHealth * stats.heartHeal) / 100)),
    }));
    setMissionHint(`Miam, un cœur ! +${stats.heartHeal}% d'énergie ❤️`);
  };

  // Handler: level complete
  const handleLevelComplete = () => {
    setPlayerState((prev) => ({ ...prev, score: prev.score + 200, stars: prev.stars + 3 }));
    setGameStatus('won');
  };

  // Handler: level failed (château détruit)
  const handleLevelFailed = (reason: 'castle') => {
    setFailReason(reason);
    setGameStatus('lost');
  };

  const startLevel = (levelNumber: number) => {
    const cfg = getLevelConfig(levelNumber);
    sceneRef.current?.startLevel(cfg);
    setPlayerState((prev) => ({
      ...prev,
      gameLevel: levelNumber,
      health: stats.maxHealth,
      snowAmmo: Math.max(prev.snowAmmo, 5),
    }));
    setMissionHint(cfg.hint);
    speakFrench(cfg.hint.replace(/[^\p{L}\p{N}\s',!.:]/gu, ''));
    setGameStatus('playing');
  };

  const handleNextLevel = () => {
    if (nextLevelLocked) return;
    startLevel(playerState.gameLevel + 1);
  };
  const handleRetryLevel = () => startLevel(playerState.gameLevel);

  // Handler: fire snowball
  const handleFireSnowball = () => {
    if (ammoRef.current <= 0) {
      setMissionHint('Réservoir vide ! Roule sur les tas de neige pour recharger ! ❄️');
      speakFrench('Ton réservoir est vide ! Va vite ramasser de la neige !');
      return;
    }

    if (sceneRef.current) {
      const fired = sceneRef.current.fireSnowball();
      if (fired) {
        ammoRef.current -= 1;
        setPlayerState((prev) => ({
          ...prev,
          snowAmmo: Math.max(0, prev.snowAmmo - 1),
        }));
        setParentStats((prev) => ({
          ...prev,
          snowballsThrown: prev.snowballsThrown + 1,
        }));
      }
    }
  };

  // Handler: virtual joystick movement
  const handleJoystickMove = (dx: number, dz: number) => {
    if (sceneRef.current) {
      // 0.016 is approx 60fps delta
      sceneRef.current.moveRobot(dx, dz, 0.016);
    }
  };

  // Handler: manual scoop button
  const handleManualScoop = () => {
    if (sceneRef.current) {
      sceneRef.current.scoopSnowManually();
    }
  };

  // Handler: chaque réponse à un défi (pour le taux de réussite parent)
  const handleAnswer = (correct: boolean) => {
    setParentStats((prev) => {
      const answersTotal = prev.answersTotal + 1;
      const answersCorrect = prev.answersCorrect + (correct ? 1 : 0);
      return {
        ...prev,
        answersTotal,
        answersCorrect,
        accuracyRate: Math.round((answersCorrect / answersTotal) * 100),
      };
    });
  };

  // Handler: unlock upgrade via educational challenges
  const handleUnlockUpgrade = (upgradeId: string, results: ChallengeResult[]) => {
    const upgrade = upgrades.find((u) => u.id === upgradeId);
    const isLook = upgrade?.paint !== undefined || upgrade?.crown;
    setUpgrades((prev) =>
      prev.map((u) => {
        if (u.id === upgradeId) return { ...u, unlocked: true, equipped: true };
        // Une seule peinture portée à la fois
        if (upgrade?.paint !== undefined && u.paint !== undefined) return { ...u, equipped: false };
        return u;
      })
    );

    // L'énergie gagnée par l'amélioration est ajoutée tout de suite
    if (upgrade?.stats.maxHealth) {
      const bonus = upgrade.stats.maxHealth;
      setPlayerState((prev) => ({ ...prev, health: prev.health + bonus }));
    }
    setPlayerState((prev) => ({ ...prev, score: prev.score + 100 * results.length }));

    const reads = results.filter((r) => r.mode === 'read');
    const writes = results.filter((r) => r.mode === 'write');
    setParentStats((prev) => {
      const masteredWords = [...prev.masteredWords];
      results.forEach((r) => {
        if (!masteredWords.includes(r.word)) masteredWords.push(r.word);
      });
      return {
        ...prev,
        wordsReadCount: prev.wordsReadCount + reads.length,
        wordsWrittenCount: prev.wordsWrittenCount + writes.length,
        challengesCompleted: prev.challengesCompleted + results.length,
        masteredWords,
      };
    });

    if (reads.length) checkTrophies('read');
    if (writes.length) checkTrophies('write');
    checkTrophies('upgrade');

    // Award educational badges / stickers
    if (reads.length) {
      triggerRewardUnlock(parentStats.wordsReadCount === 0 ? 'stk-reading-1' : 'stk-reading-2');
      if (reads.some((r) => r.word.includes(' '))) triggerRewardUnlock('stk-reading-3');
    }
    if (writes.length) {
      triggerRewardUnlock(parentStats.wordsWrittenCount === 0 ? 'stk-writing-1' : 'stk-writing-2');
    }
    triggerRewardUnlock(isLook ? 'stk-robot-2' : 'stk-robot-1');

    setMissionHint(`Génial ! ${upgrade?.name ?? 'Ton amélioration'} est installée ! 🌟`);
  };

  // Handler: toggle sticking a reward on the album sheet
  const handleToggleStickOnAlbum = (stickerId: string) => {
    setStickers((prev) =>
      prev.map((s) =>
        s.id === stickerId ? { ...s, isStuckOnAlbum: !s.isStuckOnAlbum } : s
      )
    );
  };

  // Handler: porter / retirer une peinture ou la couronne
  const handleEquipUpgrade = (upgradeId: string) => {
    setUpgrades((prev) => {
      const target = prev.find((u) => u.id === upgradeId);
      if (!target) return prev;
      const nextEquipped = !target.equipped;
      return prev.map((u) => {
        if (u.id === upgradeId) return { ...u, equipped: nextEquipped };
        if (nextEquipped && target.paint !== undefined && u.paint !== undefined) return { ...u, equipped: false };
        return u;
      });
    });
  };

  // Handler: update difficulty level from parent portal
  const handleUpdateLevel = (level: DifficultyLevel) => {
    setParentStats((prev) => ({ ...prev, currentLevel: level }));
    if (level === 'cp1') setTerrainTheme('snow-forest');
    else if (level === 'cp2') setTerrainTheme('ice-plain');
    else if (level === 'ce1') setTerrainTheme('crystal-valley');
  };

  // Handler: reset all game data
  const handleResetData = () => {
    resetAllData();
    setPlayerState(loadPlayerState());
    setUpgrades(loadUpgrades());
    setParentStats(loadParentStats());
    setTrophies(loadTrophies());
    setStickers(loadStickers());
    setTerrainTheme('snow-forest');
    startLevel(1);
  };


  return (
    <div className="relative w-screen h-screen overflow-hidden bg-sky-950 font-sans select-none">
      {/* 3D WebGL Canvas */}
      <GameCanvas
        callbacks={{
          onCollectSnow: handleCollectSnow,
          onHitEnemy: handleHitEnemy,
          onRobotDamaged: handleRobotDamaged,
          onCollectHeart: handleCollectHeart,
          onLevelProgress: setLevelProgress,
          onLevelComplete: handleLevelComplete,
          onLevelFailed: handleLevelFailed,
        }}
        onFire={handleFireSnowball}
        onScoop={handleManualScoop}
        initialLevel={initialLevel}
        ammo={playerState.snowAmmo}
        stats={stats}
        paint={look.paint}
        crown={look.crown}
        terrainTheme={terrainTheme}
        sceneRef={sceneRef}
      />

      {/* Head-Up Display (HUD) */}
      <HUD
        snowAmmo={playerState.snowAmmo}
        maxSnow={stats.maxSnow}
        health={playerState.health}
        maxHealth={stats.maxHealth}
        power={power}
        score={playerState.score}
        stars={playerState.stars}
        terrainTheme={terrainTheme}
        onChangeTerrainTheme={setTerrainTheme}
        onOpenWorkshop={() => setIsWorkshopOpen(true)}
        onOpenRewards={() => setIsRewardsOpen(true)}
        onOpenParentPortal={() => setIsParentPortalOpen(true)}
        activeMissionHint={missionHint}
        levelProgress={levelProgress}
        timeLeftLabel={formatDuration(playTime.remainingSeconds)}
        timeLow={playTime.remainingSeconds <= 600}
      />

      {/* Virtual Joystick & Action Buttons */}
      <VirtualControls
        onMove={handleJoystickMove}
        onFire={handleFireSnowball}
        onScoop={handleManualScoop}
        ammo={playerState.snowAmmo}
        maxAmmo={stats.maxSnow}
      />

      {/* Workshop & Learning Challenge Modal */}
      <WorkshopModal
        isOpen={isWorkshopOpen}
        onClose={() => setIsWorkshopOpen(false)}
        upgrades={upgrades}
        power={power}
        gameLevel={playerState.gameLevel}
        nextGate={nextGate}
        difficulty={parentStats.currentLevel}
        masteredWords={parentStats.masteredWords}
        onUnlockUpgrade={handleUnlockUpgrade}
        onEquipUpgrade={handleEquipUpgrade}
        onAnswer={handleAnswer}
      />

      {/* Rewards & Sticker Album Modal */}
      <RewardsModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        trophies={trophies}
        stickers={stickers}
        onToggleStickOnAlbum={handleToggleStickOnAlbum}
      />

      {/* Parent Tracking Portal Modal */}
      <ParentPortal
        isOpen={isParentPortalOpen}
        onClose={() => setIsParentPortalOpen(false)}
        stats={parentStats}
        onUpdateLevel={handleUpdateLevel}
        onResetData={handleResetData}
        usedTodaySeconds={playTime.usedSeconds}
        remainingTodaySeconds={playTime.remainingSeconds}
        onChangeDailyLimit={(minutes) => setParentStats((prev) => ({ ...prev, dailyLimitMinutes: minutes }))}
        onAddMinutes={playTime.addMinutes}
      />

      {/* Level Won / Lost Overlay */}
      <LevelOverlay
        status={gameStatus}
        level={playerState.gameLevel}
        failReason={failReason}
        nextTitle={getLevelConfig(playerState.gameLevel + 1).title}
        onNext={handleNextLevel}
        onRetry={handleRetryLevel}
        power={power}
        requiredPower={nextLevelRequired}
        onOpenWorkshop={() => setIsWorkshopOpen(true)}
      />

      {/* Fin du temps de jeu de la journée */}
      <TimeUpOverlay
        visible={playTime.isOver && !isParentPortalOpen}
        onOpenParentPortal={() => setIsParentPortalOpen(true)}
      />

      {/* Celebratory Reward Ceremony Overlay */}
      <CelebrationOverlay
        reward={celebrationReward}
        onClose={() => setCelebrationReward(null)}
        onOpenAlbum={() => {
          setCelebrationReward(null);
          setIsRewardsOpen(true);
        }}
      />
    </div>
  );
}
