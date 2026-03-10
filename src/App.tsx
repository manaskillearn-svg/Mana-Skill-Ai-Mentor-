import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Calendar, 
  Wrench, 
  MessageSquare, 
  Crown, 
  ChevronRight,
  CheckCircle2,
  Circle,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { UserProfile, Roadmap, Task } from './types';
import { generateRoadmap } from './lib/gemini';
import OnboardingView from './components/OnboardingView';
import DashboardView from './components/DashboardView';
import RoadmapView from './components/RoadmapView';
import ToolsView from './components/ToolsView';
import ChatView from './components/ChatView';
import PremiumView from './components/PremiumView';
import AuthView from './components/AuthView';
import TaskDetailView from './components/TaskDetailView';
import AdminView from './components/AdminView';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminView, setIsAdminView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('mana_token');
    const savedUser = localStorage.getItem('mana_user');
    
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.profile) setProfile(parsedUser.profile);
        if (parsedUser.roadmap) setRoadmap(parsedUser.roadmap);
      }
      
      // Fetch latest data from server to ensure persistence
      fetch('/api/user/me', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          if (data.user.profile) setProfile(data.user.profile);
          if (data.user.roadmap) setRoadmap(data.user.roadmap);
          localStorage.setItem('mana_user', JSON.stringify(data.user));
        }
      })
      .catch(err => console.error("Failed to fetch latest user data", err))
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Update localStorage when profile or roadmap changes
  useEffect(() => {
    if (user && (profile || roadmap)) {
      const updatedUser = { ...user, profile, roadmap };
      localStorage.setItem('mana_user', JSON.stringify(updatedUser));
    }
  }, [profile, roadmap, user]);

  const handleAuth = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    if (newUser.profile) setProfile(newUser.profile);
    if (newUser.roadmap) setRoadmap(newUser.roadmap);
    
    localStorage.setItem('mana_token', newToken);
    localStorage.setItem('mana_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    setRoadmap(null);
    localStorage.removeItem('mana_token');
    localStorage.removeItem('mana_user');
  };

  const syncWithServer = async (newProfile: UserProfile | null, newRoadmap: Roadmap | null) => {
    if (!token) return;
    try {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profile: newProfile, roadmap: newRoadmap }),
      });
    } catch (error) {
      console.error("Sync failed", error);
    }
  };

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    setLoading(true);
    setError(null);
    setProfile(newProfile);
    
    try {
      // Check for global roadmap first
      const globalRes = await fetch('/api/global-roadmap');
      const { roadmap: globalRoadmap } = await globalRes.json();
      
      if (globalRoadmap) {
        setRoadmap(globalRoadmap);
        await syncWithServer(newProfile, globalRoadmap);
      } else {
        const newRoadmap = await generateRoadmap(newProfile);
        setRoadmap(newRoadmap);
        await syncWithServer(newProfile, newRoadmap);
      }
    } catch (err) {
      console.error("Failed to generate roadmap", err);
      setError("Failed to generate your personalized roadmap. Please try again.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const submitTaskProof = (day: number, screenshotUrl: string) => {
    if (!roadmap) return;
    const newTasks = roadmap.tasks.map(t => 
      t.day === day ? { 
        ...t, 
        status: 'pending' as const, 
        screenshotUrl, 
        submittedAt: new Date().toISOString() 
      } : t
    );
    const newRoadmap: Roadmap = { ...roadmap, tasks: newTasks };
    setRoadmap(newRoadmap);
    syncWithServer(profile, newRoadmap);
  };

  const toggleTask = (day: number) => {
    if (!roadmap) return;
    const newTasks = roadmap.tasks.map(t => 
      t.day === day ? { 
        ...t, 
        completed: !t.completed, 
        status: (!t.completed ? 'completed' : 'incomplete') as 'completed' | 'incomplete' 
      } : t
    );
    const newRoadmap: Roadmap = { ...roadmap, tasks: newTasks };
    setRoadmap(newRoadmap);
    syncWithServer(profile, newRoadmap);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-android-bg">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 bg-android-primary rounded-3xl flex items-center justify-center shadow-lg mb-4"
        >
          <TrendingUp className="text-white w-10 h-10" />
        </motion.div>
        <p className="text-gray-600 font-medium animate-pulse">Preparing your mentor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-android-bg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
          <Wrench className="text-red-500 w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button 
          onClick={() => setError(null)}
          className="bg-android-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!token) {
    return <AuthView onAuth={handleAuth} />;
  }

  if (!profile?.onboarded) {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  const renderView = () => {
    if (isAdminView && user?.role === 'admin') {
      return <AdminView token={token!} onBack={() => setIsAdminView(false)} />;
    }

    if (selectedTask) {
      return <TaskDetailView task={selectedTask} onBack={() => setSelectedTask(null)} onSubmitProof={submitTaskProof} />;
    }

    switch (activeTab) {
      case 'home': return <DashboardView roadmap={roadmap} onToggleTask={toggleTask} onNavigate={setActiveTab} onLogout={handleLogout} onSelectTask={setSelectedTask} onAdminToggle={() => setIsAdminView(true)} userRole={user?.role} />;
      case 'roadmap': return <RoadmapView roadmap={roadmap} onToggleTask={toggleTask} onSelectTask={setSelectedTask} />;
      case 'tools': return <ToolsView />;
      case 'chat': return <ChatView />;
      case 'premium': return <PremiumView />;
      default: return <DashboardView roadmap={roadmap} onToggleTask={toggleTask} onNavigate={setActiveTab} onLogout={handleLogout} onSelectTask={setSelectedTask} onAdminToggle={() => setIsAdminView(true)} userRole={user?.role} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-android-bg flex flex-col relative shadow-2xl overflow-hidden">
      {/* Status Bar Mock */}
      <div className="h-8 bg-white flex items-center justify-between px-6 text-xs font-semibold text-gray-500">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full border border-gray-400" />
          <div className="w-3 h-3 rounded-full border border-gray-400" />
          <div className="w-5 h-3 rounded-sm border border-gray-400" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center px-2 py-1 safe-area-bottom">
        <button onClick={() => setActiveTab('home')} className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}>
          <Home size={24} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </button>
        <button onClick={() => setActiveTab('roadmap')} className={`bottom-nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}>
          <Calendar size={24} />
          <span className="text-[10px] mt-1 font-medium">Roadmap</span>
        </button>
        <button onClick={() => setActiveTab('tools')} className={`bottom-nav-item ${activeTab === 'tools' ? 'active' : ''}`}>
          <Wrench size={24} />
          <span className="text-[10px] mt-1 font-medium">Tools</span>
        </button>
        <button onClick={() => setActiveTab('chat')} className={`bottom-nav-item ${activeTab === 'chat' ? 'active' : ''}`}>
          <MessageSquare size={24} />
          <span className="text-[10px] mt-1 font-medium">Chat</span>
        </button>
        <button onClick={() => setActiveTab('premium')} className={`bottom-nav-item ${activeTab === 'premium' ? 'active' : ''}`}>
          <Crown size={24} />
          <span className="text-[10px] mt-1 font-medium">Premium</span>
        </button>
      </nav>
    </div>
  );
}
