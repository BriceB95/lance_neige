import React from 'react';
import { CurriculumItem } from '../types';
import { ChallengeMode, ChallengeRunner, ChallengeResult } from './ChallengeRunner';

export interface ReadingTask {
  kind: 'chest' | 'boss' | 'daily';
  items: CurriculumItem[];
  key: number;
}

interface ReadingTaskModalProps {
  task: ReadingTask | null;
  pool: CurriculumItem[];
  voiceEnabled: boolean;
  hard: boolean;
  onAnswer: (correct: boolean, item: CurriculumItem, mode: ChallengeMode) => void;
  onComplete: (task: ReadingTask, results: ChallengeResult[]) => void;
  onCancel: () => void;
}

export const ReadingTaskModal: React.FC<ReadingTaskModalProps> = ({ task, pool, voiceEnabled, hard, onAnswer, onComplete, onCancel }) => {
  if (!task) return null;
  const isBoss = task.kind === 'boss';
  const isDaily = task.kind === 'daily';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[94vh] overflow-y-auto">
        <ChallengeRunner
          key={task.key}
          title={isBoss ? 'Brise le bouclier du Boss !' : isDaily ? 'Défi du jour' : 'Coffre magique'}
          icon={isBoss ? '👑' : isDaily ? '🌟' : '🎁'}
          items={task.items}
          pool={pool}
          voiceEnabled={voiceEnabled}
          hard={hard}
          allowedModes={isDaily ? undefined : ['read', 'speak']}
          successMessage={isBoss ? 'Le bouclier se brise !' : isDaily ? 'Défi du jour réussi !' : 'Le coffre s\'ouvre !'}
          onAnswer={onAnswer}
          onComplete={(results) => onComplete(task, results)}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
};
