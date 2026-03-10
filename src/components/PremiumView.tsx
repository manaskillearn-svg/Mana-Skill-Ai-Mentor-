import { Crown, Check, ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function PremiumView() {
  const benefits = [
    "Advanced Earning Methods (₹10k+/month)",
    "Private Discord Community Access",
    "1-on-1 AI Mentorship Priority",
    "Premium Templates & Checklists",
    "Lifetime Updates & New Tools"
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="text-center">
        <div className="inline-flex p-3 bg-amber-100 text-amber-600 rounded-3xl mb-4">
          <Crown size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Go Premium</h1>
        <p className="text-gray-500">Unlock the full potential of your earning journey</p>
      </div>

      <div className="android-card bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Crown size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-bold">₹99</span>
            <span className="text-gray-400 text-sm">/ one-time</span>
          </div>

          <div className="space-y-4 mb-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-amber-500/20 p-1 rounded-full">
                  <Check size={14} className="text-amber-500" />
                </div>
                <span className="text-sm text-gray-200">{benefit}</span>
              </div>
            ))}
          </div>

          <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 transition-all active:scale-95">
            Unlock Premium Now
            <ArrowRight size={20} />
          </button>
          <p className="text-[10px] text-center text-gray-400 mt-4">Secure payment via UPI, Cards, or NetBanking</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Star />, label: "4.9/5 Rating" },
          { icon: <ShieldCheck />, label: "Safe & Secure" },
          { icon: <Zap />, label: "Instant Access" },
        ].map((item, i) => (
          <div key={i} className="android-card flex flex-col items-center gap-2 p-3 text-center">
            <div className="text-android-primary">{item.icon}</div>
            <span className="text-[10px] font-bold text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="android-card border-dashed border-2 border-gray-200 bg-transparent">
        <h3 className="font-bold text-gray-900 mb-2">Why ₹99?</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          We believe high-quality education should be accessible to every student. This small fee helps us maintain the AI servers and keep the platform ad-free for everyone.
        </p>
      </div>
    </div>
  );
}
