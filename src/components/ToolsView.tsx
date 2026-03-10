import { useState } from 'react';
import { Wrench, Hash, Instagram, Video, BookOpen, Send, Copy, Check } from 'lucide-react';
import { generateToolContent } from '../lib/gemini';
import Markdown from 'react-markdown';

export default function ToolsView() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tools = [
    { id: 'businessName', name: 'Business Name', icon: <Hash />, color: 'bg-blue-50 text-blue-600', desc: 'Generate creative brand names' },
    { id: 'instaBio', name: 'Insta Bio', icon: <Instagram />, color: 'bg-pink-50 text-pink-600', desc: 'Catchy bios for your profile' },
    { id: 'reelScript', name: 'Reel Script', icon: <Video />, color: 'bg-orange-50 text-orange-600', desc: 'Viral scripts for short videos' },
    { id: 'ebookTopic', name: 'Ebook Topics', icon: <BookOpen />, color: 'bg-emerald-50 text-emerald-600', desc: 'Profitable digital product ideas' },
  ];

  const handleGenerate = async () => {
    if (!input || !activeTool) return;
    setLoading(true);
    setResult('');
    try {
      const content = await generateToolContent(activeTool, input);
      setResult(content || '');
    } catch (error) {
      setResult('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (activeTool) {
    const tool = tools.find(t => t.id === activeTool);
    return (
      <div className="space-y-6">
        <button onClick={() => { setActiveTool(null); setResult(''); setInput(''); }} className="text-android-primary font-bold text-sm flex items-center gap-1">
          ← Back to Tools
        </button>
        
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${tool?.color}`}>
            {tool?.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{tool?.name} Generator</h1>
            <p className="text-xs text-gray-500">{tool?.desc}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="android-card">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">What is your niche/topic?</label>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Fitness for students, Digital Marketing agency..."
              className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-android-primary outline-none min-h-[100px]"
            />
            <button 
              onClick={handleGenerate}
              disabled={loading || !input}
              className="w-full bg-android-primary text-white py-3 rounded-xl font-bold mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Ideas'}
              <Send size={18} />
            </button>
          </div>

          {result && (
            <div className="android-card bg-gray-50 relative">
              <button 
                onClick={copyToClipboard}
                className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-sm text-gray-500 hover:text-android-primary"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
              <div className="prose prose-sm max-w-none text-gray-700">
                <Markdown>{result}</Markdown>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Business Tools</h1>
        <p className="text-sm text-gray-500">Free tools to speed up your growth</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tools.map((tool) => (
          <button 
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className="android-card flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className={`p-4 rounded-2xl ${tool.color}`}>
              {tool.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{tool.name}</h3>
              <p className="text-xs text-gray-500">{tool.desc}</p>
            </div>
            <Send size={16} className="text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
