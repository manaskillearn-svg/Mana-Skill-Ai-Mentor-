import { Roadmap, Task } from '../types';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Lightbulb, 
  ChevronRight,
  Trophy,
  Wrench,
  MessageSquare,
  LogOut,
  Shield
} from 'lucide-react';

interface Props {
  roadmap: Roadmap | null;
  onToggleTask: (day: number) => void;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  onSelectTask: (task: Task) => void;
  onAdminToggle: () => void;
  userRole?: string;
}

export default function DashboardView({ roadmap, onToggleTask, onNavigate, onLogout, onSelectTask, onAdminToggle, userRole }: Props) {
  if (!roadmap) return null;

  const completedCount = roadmap.tasks.filter(t => t.completed).length;
  const progress = Math.round((completedCount / roadmap.tasks.length) * 100);
  
  // Find current day task (first uncompleted or pending)
  const currentTask = roadmap.tasks.find(t => t.status !== 'completed' && !t.completed) || roadmap.tasks[roadmap.tasks.length - 1];
  const isPending = currentTask.status === 'pending';
  const isCompleted = currentTask.status === 'completed' || currentTask.completed;

  const tips = [
    "Consistency is the key to online success.",
    "Don't be afraid to fail, it's part of the learning process.",
    "Focus on one skill at a time for maximum results.",
    "Your network is your net worth. Connect with others!",
    "Start small, but think big."
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, Learner!</h1>
          <p className="text-sm text-gray-500">Ready to earn today?</p>
        </div>
        <div className="flex gap-2">
          {userRole === 'admin' && (
            <button 
              onClick={onAdminToggle}
              className="w-10 h-10 bg-android-primary/10 rounded-full flex items-center justify-center text-android-primary hover:bg-android-primary/20 transition-colors"
              title="Admin Panel"
            >
              <Shield size={20} />
            </button>
          )}
          <button onClick={onLogout} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
          <div className="w-10 h-10 bg-android-primary/10 rounded-full flex items-center justify-center text-android-primary">
            <Trophy size={20} />
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="android-card bg-android-primary text-white border-none shadow-blue-200 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Overall Progress</p>
            <h2 className="text-3xl font-bold">{progress}%</h2>
          </div>
          <TrendingUp className="text-blue-200" size={24} />
        </div>
        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-white h-full"
          />
        </div>
        <p className="text-xs text-blue-100">{completedCount} of 30 days completed</p>
      </div>

      {/* Daily Task Card */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Today's Task</h3>
          <button onClick={() => onNavigate('roadmap')} className="text-xs font-bold text-android-primary flex items-center gap-1">
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div 
          onClick={() => onSelectTask(currentTask)}
          className={`android-card border-l-4 cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all ${isPending ? 'border-l-amber-400 bg-amber-50/20' : 'border-l-android-primary'}`}
        >
          <div className="flex gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleTask(currentTask.day); }}
              className="mt-1"
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
                <p className="text-[10px] font-bold text-android-primary uppercase">Day {currentTask.day}</p>
                {isPending && <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">Pending Approval</span>}
              </div>
              <h4 className={`font-bold text-gray-900 mb-1 ${isCompleted ? 'line-through text-gray-400' : ''}`}>{currentTask.title}</h4>
              <p className="text-sm text-gray-500 line-clamp-2">{currentTask.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Tip */}
      <div className="android-card bg-amber-50 border-amber-100 flex gap-4">
        <div className="p-2 bg-amber-100 rounded-xl text-amber-600 h-fit">
          <Lightbulb size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-800 uppercase mb-1">Mentor's Tip</p>
          <p className="text-sm text-amber-900 italic">"{randomTip}"</p>
        </div>
      </div>

      {/* Quick Tools */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Quick Tools</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate('tools')} className="android-card flex flex-col items-center gap-2 text-center hover:bg-gray-50 transition-colors">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Wrench size={20} />
            </div>
            <span className="text-xs font-bold">Business Tools</span>
          </button>
          <button onClick={() => onNavigate('chat')} className="android-card flex flex-col items-center gap-2 text-center hover:bg-gray-50 transition-colors">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <MessageSquare size={20} />
            </div>
            <span className="text-xs font-bold">Ask Mentor</span>
          </button>
        </div>
      </div>
    </div>
  );
}
