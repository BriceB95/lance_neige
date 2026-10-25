import React from 'react';
import { CurriculumItem } from '../types';
import { ChallengeMode, ChallengeRunner, ChallengeResult } from './ChallengeRunner';

export interface ReadingTask {
  kind: 'chest' | 'boss';
  items: CurriculumItem[];
  key: number;
}

interface ReadingTaskModalProps {
  task: ReadingTask | null;
  pool: CurriculumItem[];
  voiceEnabled: boolean;
  onAnswer: (correct: boolean, item: CurriculumItem, mode: ChallengeMode) => void;
  onComplete: (task: ReadingTask, results: ChallengeResult[]) => void;
  onCancel: () => void;
}

export const ReadingTaskModal: React.FC<ReadingTaskModalProps> = ({ task, pool, voiceEnabled, onAnswer, onComplete, onCancel }) => {
  if (!task) return null;
  const isBoss = task.kind === 'boss';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[94vh] overflow-y-auto">
        <ChallengeRunner
          key={task.key}
          title={isBoss ? 'Brise le bouclier du Boss !' : 'Coffre magique'}
          icon={isBoss ? '👑' : '🎁'}
          items={task.items}
          pool={pool}
          voiceEnabled={voiceEnabled}
          allowedModes={['read', 'speak']}
          successMessage={isBoss ? 'Le bouclier se brise !' : 'Le coffre s\'ouvre !'}
          onAnswer={onAnswer}
          onComplete={(results) => onComplete(task, results)}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
};
