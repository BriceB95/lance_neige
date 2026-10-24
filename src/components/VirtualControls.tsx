import React, { useRef, useState, useEffect } from 'react';
import { Target, Snowflake } from 'lucide-react';

interface VirtualControlsProps {
  onMove: (dx: number, dz: number) => void;
  onFire: () => void;
  onScoop: () => void;
  ammo: number;
  maxAmmo: number;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onMove,
  onFire,
  onScoop,
  ammo,
  maxAmmo,
}) => {
  const stickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);
  const moveVectorRef = useRef({ dx: 0, dz: 0 });

  // Continuous movement loop while joystick is held
  useEffect(() => {
    let animId: number;
    const updateMove = () => {
      if (moveVectorRef.current.dx !== 0 || moveVectorRef.current.dz !== 0) {
        onMove(moveVectorRef.current.dx, moveVectorRef.current.dz);
      }
      animId = requestAnimationFrame(updateMove);
    };
    animId = requestAnimationFrame(updateMove);
    return () => cancelAnimationFrame(animId);
  }, [onMove]);

  // Touch handlers for joystick
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchIdRef.current = null;
    setKnobPos({ x: 0, y: 0 });
    moveVectorRef.current = { dx: 0, dz: 0 };
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!stickRef.current) return;
    const rect = stickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = 45;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setKnobPos({ x: dx, y: dy });

    // Normalized vector (-1 to 1)
    // Note: dy > 0 means joystick pulled DOWN (move backward / positive Z in 3D camera)
    moveVectorRef.current = {
      dx: dx / maxRadius,
      dz: dy / maxRadius,
    };
  };

  return (
    <div className="absolute inset-x-0 bottom-3 pointer-events-none flex justify-between items-end px-4 z-20 select-none">
      {/* Virtual Joystick (Bottom Left) */}
      <div className="pointer-events-auto flex flex-col items-center">
        <div
          ref={stickRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="w-28 h-28 rounded-full bg-sky-950/70 border-4 border-sky-400/80 backdrop-blur-sm relative flex items-center justify-center shadow-lg active:border-cyan-300"
          style={{ touchAction: 'none' }}
        >
          {/* Knob */}
          <div
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-300 border-2 border-white shadow-md flex items-center justify-center text-white font-bold"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/70" />
          </div>
        </div>
        <span className="text-[11px] font-bold text-sky-200 mt-1 uppercase tracking-wider drop-shadow">
          Piloter le Robot
        </span>
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="pointer-events-auto flex gap-3 items-center">
        {/* Scoop Snow Button */}
        <button
          onClick={onScoop}
          className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-blue-400 to-indigo-600 border-3 border-white text-white shadow-xl active:scale-90 transition-transform cursor-pointer"
          title="Ramasser la neige"
        >
          <Snowflake className="w-7 h-7 text-white drop-shadow" />
          <span className="text-[9px] font-bold mt-0.5">Ramasser</span>
        </button>

        {/* Shoot Snowball Button */}
        <button
          onClick={onFire}
          disabled={ammo <= 0}
          className={`flex flex-col items-center justify-center w-20 h-20 rounded-3xl border-4 text-white shadow-2xl active:scale-90 transition-all cursor-pointer ${
            ammo > 0
              ? 'bg-gradient-to-tr from-red-500 via-amber-500 to-yellow-400 border-white hover:brightness-110 animate-bounce-subtle'
              : 'bg-slate-700/80 border-slate-500 opacity-60 cursor-not-allowed'
          }`}
          title="Lancer une boule de neige"
        >
          <Target className="w-8 h-8 text-white drop-shadow" />
          <span className="text-[11px] font-extrabold uppercase mt-0.5 tracking-wide">
            Tirer !
          </span>
          <span className="text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded-full mt-0.5">
            {ammo}/{maxAmmo}
          </span>
        </button>
      </div>
    </div>
  );
};
