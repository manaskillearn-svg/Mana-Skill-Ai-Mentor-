import { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, UserRole, BudgetLevel, TimeAvailable } from '../types';
import { ArrowRight, GraduationCap, User, Wallet, Clock } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function OnboardingView({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('student');
  const [budget, setBudget] = useState<BudgetLevel>('zero');
  const [time, setTime] = useState<TimeAvailable>('1-2h');

  const handleFinish = () => {
    onComplete({
      role,
      budget,
      time,
      onboarded: true
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white p-8 flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <div className="w-12 h-1 bg-gray-100 rounded-full mb-2 flex overflow-hidden">
            <div 
              className="bg-android-primary transition-all duration-300" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <p className="text-xs font-bold text-android-primary uppercase tracking-wider">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Who are you?</h1>
            <p className="text-gray-500 mb-8">Tell us about your current status to personalize your experience.</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => setRole('student')}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${role === 'student' ? 'border-android-primary bg-blue-50' : 'border-gray-100'}`}
              >
                <div className={`p-3 rounded-xl ${role === 'student' ? 'bg-android-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <GraduationCap size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold">I'm a Student</p>
                  <p className="text-xs text-gray-500">Looking for side income</p>
                </div>
              </button>

              <button 
                onClick={() => setRole('beginner')}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${role === 'beginner' ? 'border-android-primary bg-blue-50' : 'border-gray-100'}`}
              >
                <div className={`p-3 rounded-xl ${role === 'beginner' ? 'bg-android-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <User size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold">I'm a Beginner</p>
                  <p className="text-xs text-gray-500">Starting from scratch</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Budget?</h1>
            <p className="text-gray-500 mb-8">How much can you invest in tools or ads initially?</p>
            
            <div className="space-y-4">
              {[
                { id: 'zero', label: 'Zero Budget', desc: 'Free methods only', icon: <Wallet size={20} /> },
                { id: 'low', label: 'Low Budget', desc: '₹500 - ₹2000', icon: <Wallet size={20} /> },
                { id: 'medium', label: 'Medium Budget', desc: '₹2000+', icon: <Wallet size={20} /> },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setBudget(item.id as BudgetLevel)}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${budget === item.id ? 'border-android-primary bg-blue-50' : 'border-gray-100'}`}
                >
                  <div className={`p-3 rounded-xl ${budget === item.id ? 'bg-android-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Time?</h1>
            <p className="text-gray-500 mb-8">How many hours can you dedicate daily?</p>
            
            <div className="space-y-4">
              {[
                { id: '1-2h', label: '1-2 Hours', desc: 'Part-time focus', icon: <Clock size={20} /> },
                { id: '3-5h', label: '3-5 Hours', desc: 'Serious commitment', icon: <Clock size={20} /> },
                { id: 'full-time', label: 'Full Time', desc: '8+ hours daily', icon: <Clock size={20} /> },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setTime(item.id as TimeAvailable)}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${time === item.id ? 'border-android-primary bg-blue-50' : 'border-gray-100'}`}
                >
                  <div className={`p-3 rounded-xl ${time === item.id ? 'bg-android-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <button 
        onClick={() => step < 3 ? setStep(step + 1) : handleFinish()}
        className="mt-8 w-full bg-android-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
      >
        {step < 3 ? 'Continue' : 'Generate My Roadmap'}
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
