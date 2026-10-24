import React, { useEffect, useRef } from 'react';
import { RoboNeigeScene } from '../game/threeScene';
import { TerrainTheme } from '../types';

interface GameCanvasProps {
  onCollectSnow: (amount: number) => void;
  onHitEnemy: (scoreGain: number, isDouble?: boolean) => void;
  onRobotDamaged?: (amount: number) => void;
  ammo: number;
  maxAmmo: number;
  speedMultiplier: number;
  cannonTier: number;
  hasShield: boolean;
  isGolden: boolean;
  terrainTheme: TerrainTheme;
  sceneRef: React.MutableRefObject<RoboNeigeScene | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onCollectSnow,
  onHitEnemy,
  onRobotDamaged,
  ammo,
  maxAmmo,
  speedMultiplier,
  cannonTier,
  hasShield,
  isGolden,
  terrainTheme,
  sceneRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new RoboNeigeScene(containerRef.current, {
      onCollectSnow,
      onHitEnemy,
      onRobotDamaged,
    });
    sceneRef.current = scene;

    // Window resize handler
    const handleResize = () => {
      scene.handleResize();
    };
    window.addEventListener('resize', handleResize);

    // Keyboard support for desktop
    const keysDown: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown[e.key.toLowerCase()] = true;

      // Spacebar to shoot
      if (e.code === 'Space') {
        e.preventDefault();
        if (ammo > 0) {
          scene.fireSnowball();
        }
      }
      // R to scoop snow
      if (e.key.toLowerCase() === 'r') {
        scene.scoopSnowManually();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Continuous key drive loop
    let animId: number;
    let lastTime = performance.now();
    const driveLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      let dx = 0;
      let dz = 0;
      if (keysDown['arrowup'] || keysDown['w'] || keysDown['z']) dz -= 1;
      if (keysDown['arrowdown'] || keysDown['s']) dz += 1;
      if (keysDown['arrowleft'] || keysDown['q'] || keysDown['a']) dx -= 1;
      if (keysDown['arrowright'] || keysDown['d']) dx += 1;

      if (dx !== 0 || dz !== 0) {
        scene.moveRobot(dx, dz, dt);
      }

      animId = requestAnimationFrame(driveLoop);
    };
    animId = requestAnimationFrame(driveLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Sync upgrades, visual changes and terrain theme to 3D scene
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateUpgrades({
        currentSnow: ammo,
        maxSnow: maxAmmo,
        speedMultiplier,
        cannonTier,
        hasShield,
        isGolden,
      });
      sceneRef.current.setTerrainTheme(terrainTheme);
    }
  }, [ammo, maxAmmo, speedMultiplier, cannonTier, hasShield, isGolden, terrainTheme, sceneRef]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden touch-none"
    />
  );
};
