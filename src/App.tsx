import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { VirtualControls } from './components/VirtualControls';
import { HUD } from './components/HUD';
import { WorkshopModal } from './components/WorkshopModal';
import { ParentPortal } from './components/ParentPortal';
import { RewardsModal } from './components/RewardsModal';
import { CelebrationOverlay } from './components/CelebrationOverlay';
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
import { PlayerState, UpgradeItem, ParentStats, Trophy, StickerReward, DifficultyLevel, TerrainTheme } from './types';
import { speakFrench } from './audio/soundEffects';

export default function App() {
  const [playerState, setPlayerState] = useState<PlayerState>(loadPlayerState);
  const [upgrades, setUpgrades] = useState<UpgradeItem[]>(loadUpgrades);
  const [parentStats, setParentStats] = useState<ParentStats>(loadParentStats);
  const [trophies, setTrophies] = useState<Trophy[]>(loadTrophies);
  const [stickers, setStickers] = useState<StickerReward[]>(loadStickers);
  const [celebrationReward, setCelebrationReward] = useState<StickerReward | null>(null);
  const [terrainTheme, setTerrainTheme] = useState<TerrainTheme>('snow-forest');

  // Modal visibility states
  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isParentPortalOpen, setIsParentPortalOpen] = useState(false);

  // Mission prompt for child
  const [missionHint, setMissionHint] = useState<string>(
    'Guide ton robot pour ramasser la neige au sol ! ❄️'
  );

  const sceneRef = useRef<RoboNeigeScene | null>(null);

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
      const nextSnow = Math.min(prev.maxSnow, prev.snowAmmo + amount);
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
    setPlayerState((prev) => {
      const nextHealth = Math.max(0, prev.health - amount);
      if (nextHealth === 0) {
        speakFrench("Oups ! Robot tout gelé ! Réchauffement magique en cours...");
        setTimeout(() => {
          setPlayerState((p) => ({ ...p, health: 100 }));
          setMissionHint('Robot réparé et réchauffé ! Reprends l\'aventure ! ☀️');
        }, 2000);
      }
      return { ...prev, health: nextHealth };
    });
  };

  // Handler: fire snowball
  const handleFireSnowball = () => {
    if (playerState.snowAmmo <= 0) {
      setMissionHint('Réservoir vide ! Roule sur les tas de neige pour recharger ! ❄️');
      speakFrench('Ton réservoir est vide ! Va vite ramasser de la neige !');
      return;
    }

    if (sceneRef.current) {
      const fired = sceneRef.current.fireSnowball();
      if (fired) {
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

  // Handler: unlock upgrade via educational challenge
  const handleUnlockUpgrade = (upgradeId: string, word: string, mode: 'read' | 'write') => {
    setUpgrades((prev) =>
      prev.map((u) => {
        if (u.id === upgradeId) {
          return { ...u, unlocked: true, equipped: true };
        }
        return u;
      })
    );

    // Apply upgrade benefits to player
    setPlayerState((prev) => {
      let maxSnow = prev.maxSnow;
      let speedMultiplier = prev.speedMultiplier;
      let cannonTier = prev.cannonTier;
      let hasShield = prev.hasShield;
      let isGolden = prev.colorTheme === 'gold';

      if (upgradeId === 'upgrade-tank') maxSnow = 20;
      if (upgradeId === 'upgrade-speed') speedMultiplier = 1.35;
      if (upgradeId === 'upgrade-cannon') cannonTier = 2;
      if (upgradeId === 'upgrade-shield') hasShield = true;
      if (upgradeId === 'upgrade-gold') isGolden = true;

      return {
        ...prev,
        maxSnow,
        speedMultiplier,
        cannonTier,
        hasShield,
        colorTheme: isGolden ? 'gold' : prev.colorTheme,
        score: prev.score + 100,
      };
    });

    // Update parent stats
    setParentStats((prev) => {
      const isRead = mode === 'read';
      const wordsReadCount = isRead ? prev.wordsReadCount + 1 : prev.wordsReadCount;
      const wordsWrittenCount = !isRead ? prev.wordsWrittenCount + 1 : prev.wordsWrittenCount;
      const challengesCompleted = prev.challengesCompleted + 1;
      const masteredWords = prev.masteredWords.includes(word)
        ? prev.masteredWords
        : [...prev.masteredWords, word];

      return {
        ...prev,
        wordsReadCount,
        wordsWrittenCount,
        challengesCompleted,
        masteredWords,
      };
    });

    checkTrophies(mode === 'read' ? 'read' : 'write');
    checkTrophies('upgrade');

    // Award educational badges / stickers
    if (mode === 'read') {
      if (parentStats.wordsReadCount === 0) {
        triggerRewardUnlock('stk-reading-1');
      } else {
        triggerRewardUnlock('stk-reading-2');
      }
      if (word.includes(' ') || word.length > 5) {
        triggerRewardUnlock('stk-reading-3');
      }
    } else {
      if (parentStats.wordsWrittenCount === 0) {
        triggerRewardUnlock('stk-writing-1');
      } else {
        triggerRewardUnlock('stk-writing-2');
      }
    }

    if (upgradeId === 'upgrade-gold') {
      triggerRewardUnlock('stk-robot-2');
    } else {
      triggerRewardUnlock('stk-robot-1');
    }

    setMissionHint(`Génial ! Tu as amélioré ton robot avec ${word} ! 🌟`);
  };

  // Handler: toggle sticking a reward on the album sheet
  const handleToggleStickOnAlbum = (stickerId: string) => {
    setStickers((prev) =>
      prev.map((s) =>
        s.id === stickerId ? { ...s, isStuckOnAlbum: !s.isStuckOnAlbum } : s
      )
    );
  };

  // Handler: toggle equipping an unlocked upgrade
  const handleEquipUpgrade = (upgradeId: string) => {
    setUpgrades((prev) =>
      prev.map((u) => {
        if (u.id === upgradeId) {
          const nextEquipped = !u.equipped;
          // Apply or revert stat
          setPlayerState((pState) => {
            if (upgradeId === 'upgrade-tank') {
              return { ...pState, maxSnow: nextEquipped ? 20 : 10 };
            }
            if (upgradeId === 'upgrade-speed') {
              return { ...pState, speedMultiplier: nextEquipped ? 1.35 : 1.0 };
            }
            if (upgradeId === 'upgrade-cannon') {
              return { ...pState, cannonTier: nextEquipped ? 2 : 1 };
            }
            if (upgradeId === 'upgrade-shield') {
              return { ...pState, hasShield: nextEquipped };
            }
            if (upgradeId === 'upgrade-gold') {
              return { ...pState, colorTheme: nextEquipped ? 'gold' : 'cyan' };
            }
            return pState;
          });
          return { ...u, equipped: nextEquipped };
        }
        return u;
      })
    );
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
  };

  const isGolden = playerState.colorTheme === 'gold';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-sky-950 font-sans select-none">
      {/* 3D WebGL Canvas */}
      <GameCanvas
        onCollectSnow={handleCollectSnow}
        onHitEnemy={handleHitEnemy}
        onRobotDamaged={handleRobotDamaged}
        onFire={handleFireSnowball}
        onScoop={() => {
          if (sceneRef.current) sceneRef.current.scoopSnowManually();
        }}
        ammo={playerState.snowAmmo}
        maxAmmo={playerState.maxSnow}
        speedMultiplier={playerState.speedMultiplier}
        cannonTier={playerState.cannonTier}
        hasShield={playerState.hasShield}
        isGolden={isGolden}
        terrainTheme={terrainTheme}
        sceneRef={sceneRef}
      />

      {/* Head-Up Display (HUD) */}
      <HUD
        snowAmmo={playerState.snowAmmo}
        maxSnow={playerState.maxSnow}
        health={playerState.health}
        maxHealth={playerState.maxHealth}
        score={playerState.score}
        stars={playerState.stars}
        terrainTheme={terrainTheme}
        onChangeTerrainTheme={setTerrainTheme}
        onOpenWorkshop={() => setIsWorkshopOpen(true)}
        onOpenRewards={() => setIsRewardsOpen(true)}
        onOpenParentPortal={() => setIsParentPortalOpen(true)}
        activeMissionHint={missionHint}
      />

      {/* Virtual Joystick & Action Buttons */}
      <VirtualControls
        onMove={handleJoystickMove}
        onFire={handleFireSnowball}
        onScoop={handleManualScoop}
        ammo={playerState.snowAmmo}
        maxAmmo={playerState.maxSnow}
      />

      {/* Workshop & Learning Challenge Modal */}
      <WorkshopModal
        isOpen={isWorkshopOpen}
        onClose={() => setIsWorkshopOpen(false)}
        upgrades={upgrades}
        onUnlockUpgrade={handleUnlockUpgrade}
        onEquipUpgrade={handleEquipUpgrade}
        snowCollected={parentStats.snowCollected}
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
