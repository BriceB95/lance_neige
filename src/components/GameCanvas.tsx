import React, { useEffect, useRef } from 'react';
import { RoboNeigeScene, SceneCallbacks } from '../game/threeScene';
import { LevelConfig, RobotStats, TerrainTheme } from '../types';

interface GameCanvasProps {
  callbacks: SceneCallbacks;
  onFire: () => void;
  onScoop: () => void;
  initialLevel: LevelConfig;
  ammo: number;
  stats: RobotStats;
  paint: number;
  crown: boolean;
  terrainTheme: TerrainTheme;
  sceneRef: React.MutableRefObject<RoboNeigeScene | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  callbacks,
  onFire,
  onScoop,
  initialLevel,
  ammo,
  stats,
  paint,
  crown,
  terrainTheme,
  sceneRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Toujours appeler la dernière version des handlers React (évite les closures figées)
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const onFireRef = useRef(onFire);
  onFireRef.current = onFire;
  const onScoopRef = useRef(onScoop);
  onScoopRef.current = onScoop;

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new RoboNeigeScene(containerRef.current, {
      onCollectSnow: (amount) => callbacksRef.current.onCollectSnow(amount),
      onHitEnemy: (score, isDouble) => callbacksRef.current.onHitEnemy(score, isDouble),
      onRobotDamaged: (amount) => callbacksRef.current.onRobotDamaged?.(amount),
      onCollectHeart: () => callbacksRef.current.onCollectHeart?.(),
      onLevelProgress: (p) => callbacksRef.current.onLevelProgress?.(p),
      onLevelComplete: () => callbacksRef.current.onLevelComplete?.(),
      onLevelFailed: (r) => callbacksRef.current.onLevelFailed?.(r),
    });
    sceneRef.current = scene;
    scene.startLevel(initialLevel);

    // Window resize handler
    const handleResize = () => {
      scene.handleResize();
    };
    window.addEventListener('resize', handleResize);

    // Keyboard support for desktop
    const keysDown: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown[e.key.toLowerCase()] = true;

      // Espace = tirer (même règle de stock que le bouton Tirer)
      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) onFireRef.current();
      }
      // R to scoop snow
      if (e.key.toLowerCase() === 'r') {
        onScoopRef.current();
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
      sceneRef.current.updateRobot({ stats, currentSnow: ammo, paint, crown });
      sceneRef.current.setTerrainTheme(terrainTheme);
    }
  }, [ammo, stats, paint, crown, terrainTheme, sceneRef]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden touch-none"
    />
  );
};
