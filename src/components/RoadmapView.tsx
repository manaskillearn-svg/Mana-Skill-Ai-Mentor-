import { Roadmap, Task } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  roadmap: Roadmap | null;
  onToggleTask: (day: number) => void;
  onSelectTask: (task: Task) => void;
}

export default function RoadmapView({ roadmap, onToggleTask, onSelectTask }: Props) {
  if (!roadmap) return null;

  const completedCount = roadmap.tasks.filter(t => t.completed).length;
  const progress = Math.round((completedCount / roadmap.tasks.length) * 100);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">30-Day Roadmap</h1>
          <p className="text-sm text-gray-500 mb-4">{roadmap.title}</p>
        </div>

        {/* Overall Progress Bar */}
        <div className="android-card bg-white p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overall Progress</span>
            <span className="text-xs font-bold text-android-primary">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-android-primary h-full"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">
            {completedCount} of {roadmap.tasks.length} tasks completed
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {roadmap.tasks.map((task, index) => {
          const isPending = task.status === 'pending';
          const isCompleted = task.status === 'completed' || task.completed;
          
          return (
            <motion.div 
              key={task.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectTask(task)}
              className={`android-card flex flex-col gap-3 transition-all cursor-pointer hover:border-android-primary/30 active:scale-[0.98] ${isCompleted ? 'bg-gray-50 opacity-75' : isPending ? 'border-amber-200 bg-amber-50/30' : ''}`}
            >
              <div className="flex gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleTask(task.day); }}
                  className="mt-1 shrink-0"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="text-green-500" size={24} />
                  ) : isPending ? (
                    <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="text-gray-300" size={24} />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold bg-android-primary/10 text-android-primary px-2 py-0.5 rounded-full uppercase">Day {task.day}</span>
                    {isPending && <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">Pending Approval</span>}
                  </div>
                  <h4 className={`font-bold text-gray-900 mb-1 ${isCompleted ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
                </div>
              </div>
              
              {/* Task Progress Indicator */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: isCompleted ? '100%' : isPending ? '50%' : '0%' }}
                      className={`${isCompleted ? 'bg-green-500' : isPending ? 'bg-amber-400' : 'bg-android-primary'} h-full`}
                    />
                  </div>
                </div>
                <span className={`text-[10px] font-bold ${isCompleted ? 'text-green-600' : isPending ? 'text-amber-600' : 'text-gray-400'}`}>
                  {isCompleted ? '100%' : isPending ? '50%' : '0%'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
