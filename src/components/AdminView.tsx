import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Settings, 
  Trash2, 
  Edit3, 
  Search, 
  Shield, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Save,
  RefreshCw,
  Globe,
  Play
} from 'lucide-react';
import { generateRoadmap } from '../lib/gemini';

interface User {
  id: number;
  email: string;
  role: string;
  profile: any;
  roadmap: any;
}

interface Props {
  token: string;
  onBack: () => void;
}

export default function AdminView({ token, onBack }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'approvals' | 'global'>('users');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [globalRoadmap, setGlobalRoadmap] = useState<any>(null);
  const [editMode, setEditMode] = useState<'basic' | 'roadmap' | 'json'>('basic');
  const [error, setError] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchGlobalRoadmap();
  }, []);

  const fetchGlobalRoadmap = async () => {
    try {
      const response = await fetch('/api/global-roadmap');
      const data = await response.json();
      if (response.ok) {
        setGlobalRoadmap(data.roadmap);
      }
    } catch (err) {
      console.error('Failed to fetch global roadmap');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(editingUser)
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        setEditingUser(null);
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleRegenerate = async () => {
    if (!editingUser || !editingUser.profile) {
      alert("User needs a profile to regenerate roadmap");
      return;
    }
    if (!confirm("This will replace the current roadmap with a new one. Continue?")) return;
    
    setIsRegenerating(true);
    try {
      const newRoadmap = await generateRoadmap(editingUser.profile);
      setEditingUser({ ...editingUser, roadmap: newRoadmap });
    } catch (err) {
      alert("Regeneration failed");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSetGlobal = async (roadmapToSet?: any) => {
    // Check if roadmapToSet is a roadmap object or an event
    const roadmap = (roadmapToSet && typeof roadmapToSet === 'object' && 'tasks' in roadmapToSet) 
      ? roadmapToSet 
      : (editingUser?.roadmap);

    if (!roadmap) {
      alert("No roadmap data found to set as global.");
      return;
    }
    if (!confirm("Set this roadmap as the global roadmap for all new users?")) return;

    try {
      const response = await fetch('/api/global-roadmap', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ roadmap })
      });
      if (response.ok) {
        alert("Global roadmap updated successfully!");
        fetchGlobalRoadmap();
      } else {
        const data = await response.json();
        alert(`Failed to set global roadmap: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert("Failed to set global roadmap due to a network error");
    }
  };

  const handleApplyToAll = async (roadmapToApply?: any) => {
    // Check if roadmapToApply is a roadmap object or an event
    const roadmap = (roadmapToApply && typeof roadmapToApply === 'object' && 'tasks' in roadmapToApply) 
      ? roadmapToApply 
      : (editingUser?.roadmap);

    if (!roadmap) {
      alert("No roadmap data found to apply.");
      return;
    }
    if (!confirm("This will overwrite the roadmap for EVERY user in the system with this one. Are you absolutely sure?")) return;

    try {
      const response = await fetch('/api/admin/users/apply-roadmap', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ roadmap })
      });
      if (response.ok) {
        alert("Roadmap applied to all users successfully!");
        fetchUsers(); // Refresh the list
      } else {
        const data = await response.json();
        alert(`Failed to apply roadmap: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert("Failed to apply roadmap due to a network error");
    }
  };

  const initializeGlobalRoadmap = () => {
    setGlobalRoadmap({
      title: "Default Earning Roadmap",
      tasks: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        title: `Day ${i + 1} Task`,
        description: "Task description goes here...",
        completed: false,
        status: 'incomplete'
      }))
    });
  };

  const handleApproval = async (userId: number, day: number, approved: boolean) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newTasks = user.roadmap.tasks.map((t: any) => {
      if (t.day === day) {
        return { 
          ...t, 
          status: approved ? 'completed' : 'incomplete',
          completed: approved
        };
      }
      return t;
    });

    const updatedUser = { ...user, roadmap: { ...user.roadmap, tasks: newTasks } };

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updatedUser)
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
      }
    } catch (err) {
      alert('Approval action failed');
    }
  };

  const pendingApprovals = users.flatMap(user => 
    (user.roadmap?.tasks || [])
      .filter((t: any) => t.status === 'pending')
      .map((t: any) => ({ ...t, userId: user.id, userEmail: user.email }))
  );

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-android-primary" /> Admin Panel
          </h1>
        </div>
        <div className="text-xs font-bold text-gray-400 uppercase">
          Total Users: {users.length}
        </div>
      </div>

      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'users' ? 'text-android-primary border-b-2 border-android-primary' : 'text-gray-400'}`}
        >
          Users ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('approvals')}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'approvals' ? 'text-android-primary border-b-2 border-android-primary' : 'text-gray-400'}`}
        >
          Pending Approvals ({pendingApprovals.length})
        </button>
        <button 
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'global' ? 'text-android-primary border-b-2 border-android-primary' : 'text-gray-400'}`}
        >
          Global Roadmap
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search users by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-android-primary outline-none shadow-sm"
            />
          </div>

          <div className="space-y-4">
            {filteredUsers.map(user => (
              <motion.div 
                key={user.id}
                layout
                className="android-card flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      {user.email}
                      {user.role === 'admin' && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded uppercase">Admin</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {user.id} • {user.roadmap?.tasks?.filter((t: any) => t.completed).length || 0}/30 Days Done
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingUser(user)}
                    className="p-2 text-gray-400 hover:text-android-primary hover:bg-android-primary/5 rounded-xl transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : activeTab === 'approvals' ? (
        <div className="space-y-4">
          {pendingApprovals.map((approval, idx) => (
            <motion.div 
              key={`${approval.userId}-${approval.day}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="android-card space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-android-primary uppercase mb-1">Day {approval.day} • {approval.userEmail}</div>
                  <h3 className="font-bold text-gray-900">{approval.title}</h3>
                </div>
                <div className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded uppercase font-bold">Pending</div>
              </div>
              
              {approval.screenshotUrl && (
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <img 
                    src={approval.screenshotUrl} 
                    alt="Proof" 
                    className="w-full max-h-64 object-contain bg-gray-50" 
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => handleApproval(approval.userId, approval.day, false)}
                  className="flex-1 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Reject
                </button>
                <button 
                  onClick={() => handleApproval(approval.userId, approval.day, true)}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <CheckCircle2 size={18} /> Approve
                </button>
              </div>
            </motion.div>
          ))}
          {pendingApprovals.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">All caught up! No pending approvals.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="android-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Master Roadmap</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleApplyToAll(globalRoadmap)}
                  className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 hover:bg-red-100"
                >
                  <Users size={14} />
                  Apply to All Users
                </button>
                <button 
                  onClick={() => handleSetGlobal(globalRoadmap)}
                  className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 hover:bg-green-100"
                >
                  <Save size={14} />
                  Save Changes
                </button>
              </div>
            </div>
            
            {globalRoadmap ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Roadmap Title</label>
                  <input 
                    type="text"
                    value={globalRoadmap.title || ''}
                    onChange={(e) => setGlobalRoadmap({ ...globalRoadmap, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm outline-none"
                  />
                </div>
                
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  {globalRoadmap.tasks?.map((task: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-android-primary">Day {task.day}</span>
                      </div>
                      <input 
                        type="text"
                        value={task.title}
                        onChange={(e) => {
                          const newTasks = [...globalRoadmap.tasks];
                          newTasks[idx] = { ...task, title: e.target.value };
                          setGlobalRoadmap({ ...globalRoadmap, tasks: newTasks });
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold outline-none"
                      />
                      <textarea 
                        value={task.description}
                        onChange={(e) => {
                          const newTasks = [...globalRoadmap.tasks];
                          newTasks[idx] = { ...task, description: e.target.value };
                          setGlobalRoadmap({ ...globalRoadmap, tasks: newTasks });
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                        rows={2}
                      />
                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
                        <Play size={14} className="text-gray-400" />
                        <input 
                          type="text"
                          value={task.videoId || ''}
                          onChange={(e) => {
                            const newTasks = [...globalRoadmap.tasks];
                            newTasks[idx] = { ...task, videoId: e.target.value };
                            setGlobalRoadmap({ ...globalRoadmap, tasks: newTasks });
                          }}
                          className="flex-1 text-xs outline-none"
                          placeholder="YouTube Video ID"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <div className="text-gray-400 italic">
                  No global roadmap set.
                </div>
                <button 
                  onClick={initializeGlobalRoadmap}
                  className="bg-android-primary text-white px-6 py-2 rounded-xl font-bold shadow-md"
                >
                  Create Default Roadmap
                </button>
                <p className="text-xs text-gray-400">
                  Or edit a user's roadmap and click "Set as Global" to use theirs.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-xl">Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            
              <div className="flex border-b border-gray-100 mb-4">
                <button 
                  onClick={() => setEditMode('basic')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider ${editMode === 'basic' ? 'text-android-primary border-b-2 border-android-primary' : 'text-gray-400'}`}
                >
                  Basic Info
                </button>
                <button 
                  onClick={() => setEditMode('roadmap')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider ${editMode === 'roadmap' ? 'text-android-primary border-b-2 border-android-primary' : 'text-gray-400'}`}
                >
                  Roadmap Tasks
                </button>
                <button 
                  onClick={() => setEditMode('json')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider ${editMode === 'json' ? 'text-android-primary border-b-2 border-android-primary' : 'text-gray-400'}`}
                >
                  Advanced (JSON)
                </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {editMode === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Role</label>
                      <select 
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm outline-none"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Roadmap Title</label>
                      <input 
                        type="text"
                        value={editingUser.roadmap?.title || ''}
                        onChange={(e) => setEditingUser({
                          ...editingUser, 
                          roadmap: { ...editingUser.roadmap, title: e.target.value }
                        })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm outline-none"
                      />
                    </div>
                  </div>
                )}

                {editMode === 'roadmap' && (
                  <div className="space-y-6">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={handleApplyToAll}
                        className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 hover:bg-red-100"
                      >
                        <Users size={14} />
                        Apply to All
                      </button>
                      <button 
                        onClick={handleSetGlobal}
                        className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 hover:bg-green-100"
                      >
                        <Globe size={14} />
                        Set as Global
                      </button>
                      <button 
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-100 disabled:opacity-50"
                      >
                        <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                        {isRegenerating ? 'Regenerating...' : 'Regenerate Roadmap'}
                      </button>
                    </div>
                    {editingUser.roadmap?.tasks?.map((task: any, idx: number) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-android-primary">Day {task.day}</span>
                          <input 
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => {
                              const newTasks = [...editingUser.roadmap.tasks];
                              newTasks[idx] = { 
                                ...task, 
                                completed: e.target.checked,
                                status: (e.target.checked ? 'completed' : 'incomplete') as 'completed' | 'incomplete'
                              };
                              setEditingUser({ ...editingUser, roadmap: { ...editingUser.roadmap, tasks: newTasks } });
                            }}
                            className="w-4 h-4 rounded text-android-primary"
                          />
                        </div>
                        <input 
                          type="text"
                          value={task.title}
                          onChange={(e) => {
                            const newTasks = [...editingUser.roadmap.tasks];
                            newTasks[idx] = { ...task, title: e.target.value };
                            setEditingUser({ ...editingUser, roadmap: { ...editingUser.roadmap, tasks: newTasks } });
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold outline-none"
                          placeholder="Task Title"
                        />
                        <textarea 
                          value={task.description}
                          onChange={(e) => {
                            const newTasks = [...editingUser.roadmap.tasks];
                            newTasks[idx] = { ...task, description: e.target.value };
                            setEditingUser({ ...editingUser, roadmap: { ...editingUser.roadmap, tasks: newTasks } });
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                          rows={3}
                          placeholder="Task Description"
                        />
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
                          <Play size={14} className="text-gray-400" />
                          <input 
                            type="text"
                            value={task.videoId || ''}
                            onChange={(e) => {
                              const newTasks = [...editingUser.roadmap.tasks];
                              newTasks[idx] = { ...task, videoId: e.target.value };
                              setEditingUser({ ...editingUser, roadmap: { ...editingUser.roadmap, tasks: newTasks } });
                            }}
                            className="flex-1 text-xs outline-none"
                            placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)"
                          />
                        </div>
                      </div>
                    ))}
                    {!editingUser.roadmap?.tasks?.length && (
                      <div className="text-center py-8 text-gray-400 italic">No tasks found in roadmap.</div>
                    )}
                  </div>
                )}

                {editMode === 'json' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Profile Data (JSON)</label>
                      <textarea 
                        value={JSON.stringify(editingUser.profile, null, 2)}
                        onChange={(e) => {
                          try {
                            setEditingUser({...editingUser, profile: JSON.parse(e.target.value)});
                          } catch (err) {}
                        }}
                        rows={5}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Roadmap Data (JSON)</label>
                      <textarea 
                        value={JSON.stringify(editingUser.roadmap, null, 2)}
                        onChange={(e) => {
                          try {
                            setEditingUser({...editingUser, roadmap: JSON.parse(e.target.value)});
                          } catch (err) {}
                        }}
                        rows={8}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-mono outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

            <div className="p-6 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                className="flex-1 bg-android-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
