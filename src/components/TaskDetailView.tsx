import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Play, Upload, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Task } from '../types';

interface Props {
  task: Task;
  onBack: () => void;
  onSubmitProof: (day: number, screenshotUrl: string) => void;
}

export default function TaskDetailView({ task, onBack, onSubmitProof }: Props) {
  const [screenshot, setScreenshot] = useState<string | null>(task.screenshotUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size too large (max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!screenshot) {
      setError('Please upload a screenshot to prove completion');
      return;
    }
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      onSubmitProof(task.day, screenshot);
      setUploading(false);
      onBack();
    }, 1500);
  };

  // YouTube video ID from task or fallback
  const videoId = task.videoId || "dQw4w9WgXcQ";

  const isPending = task.status === 'pending';
  const isCompleted = task.status === 'completed' || task.completed;

  return (
    <div className="space-y-6 pb-10">
      <button onClick={onBack} className="text-android-primary font-bold text-sm flex items-center gap-1">
        <ArrowLeft size={16} /> Back to Roadmap
      </button>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold bg-android-primary/10 text-android-primary px-2 py-0.5 rounded-full uppercase">Day {task.day}</span>
          {isCompleted && <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase">Completed</span>}
          {isPending && <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">Pending Approval</span>}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
      </div>

      {/* Video Section */}
      <div className="android-card p-0 overflow-hidden bg-black aspect-video relative group">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="How to Complete Day 1"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <div className="android-card">
        <h3 className="font-bold text-gray-900 mb-2">Task Description</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
      </div>

      {/* Completion Proof Section */}
      {!isCompleted && !isPending && (
        <div className="android-card space-y-4">
          <h3 className="font-bold text-gray-900">Proof of Completion</h3>
          <p className="text-xs text-gray-500">Upload a screenshot showing you've completed today's task.</p>
          
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-2 transition-all ${screenshot ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              {screenshot ? (
                <>
                  <img src={screenshot} alt="Screenshot" className="w-full h-32 object-cover rounded-xl mb-2" />
                  <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Screenshot Uploaded
                  </p>
                </>
              ) : (
                <>
                  <div className="p-3 bg-white rounded-full shadow-sm text-gray-400">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Tap to upload screenshot</p>
                  <p className="text-[10px] text-gray-400">JPG, PNG up to 5MB</p>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-50 p-3 rounded-xl">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button 
            onClick={handleSubmit}
            disabled={uploading || !screenshot}
            className="w-full bg-android-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {uploading ? 'Submitting...' : 'Submit for Approval'}
            <CheckCircle2 size={20} />
          </button>
        </div>
      )}

      {isPending && (
        <div className="android-card bg-amber-50 border-amber-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="font-bold text-amber-900">Pending Approval</h4>
            <p className="text-xs text-amber-700">Your proof has been submitted. An admin will review it shortly.</p>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="android-card bg-green-50 border-green-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="font-bold text-green-900">Task Completed!</h4>
            <p className="text-xs text-green-700">Great job! You're one step closer to your goal.</p>
          </div>
        </div>
      )}
    </div>
  );
}
