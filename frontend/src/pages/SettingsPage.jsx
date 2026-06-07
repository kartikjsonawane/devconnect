import { useState } from 'react';
import { Settings, Lock, Bell, Shield, LogOut } from 'lucide-react';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card p-6 rounded-xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary-500/10 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-primary-400" />
        </div>
        <h2 className="font-display font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    likes: true,
    comments: true,
    follows: true,
    connections: true,
    endorsements: true,
  });

  const handlePwChange = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password updated!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
          <Settings size={20} className="text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold">Settings</h1>
          <p className="text-sm text-[#8892a4]">Manage your account preferences</p>
        </div>
      </div>

      {/* Account info */}
      <Section icon={Shield} title="Account">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-[#8892a4] mb-1.5">Email address</label>
            <input className="input w-full" value={user?.email || ''} disabled />
            <p className="text-xs text-[#8892a4] mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm text-[#8892a4] mb-1.5">Username</label>
            <input className="input w-full" value={user?.username || ''} disabled />
          </div>
        </div>
      </Section>

      {/* Password */}
      <Section icon={Lock} title="Change Password">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-[#8892a4] mb-1.5">Current password</label>
            <input
              type="password"
              className="input w-full"
              value={pwForm.currentPassword}
              onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm text-[#8892a4] mb-1.5">New password</label>
            <input
              type="password"
              className="input w-full"
              value={pwForm.newPassword}
              onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
              placeholder="Minimum 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm text-[#8892a4] mb-1.5">Confirm new password</label>
            <input
              type="password"
              className="input w-full"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <button
            onClick={handlePwChange}
            disabled={pwLoading}
            className="btn-primary px-6 py-2"
          >
            {pwLoading ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notification Preferences">
        <div className="space-y-4">
          {Object.entries(notifPrefs).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium capitalize">{key === 'follows' ? 'New Followers' : key === 'endorsements' ? 'Skill Endorsements' : `Post ${key}`}</p>
                <p className="text-xs text-[#8892a4]">
                  {key === 'likes' && 'When someone likes your posts'}
                  {key === 'comments' && 'When someone comments on your posts'}
                  {key === 'follows' && 'When someone follows you'}
                  {key === 'connections' && 'Connection requests and acceptances'}
                  {key === 'endorsements' && 'When someone endorses your skills'}
                </p>
              </div>
              <button
                onClick={() => setNotifPrefs(p => ({ ...p, [key]: !enabled }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-primary-500' : 'bg-[#2a2d3d]'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Danger zone */}
      <div className="card p-6 rounded-xl border-red-500/20">
        <h2 className="font-display font-semibold text-red-400 mb-4">Sign Out</h2>
        <p className="text-sm text-[#8892a4] mb-4">You'll be signed out of all devices.</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}
