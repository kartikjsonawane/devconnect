import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Camera, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/services/api';
import toast from 'react-hot-toast';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
      >
        <h2 className="font-display font-semibold">{title}</h2>
        {open ? <ChevronUp size={16} className="text-[#8892a4]" /> : <ChevronDown size={16} className="text-[#8892a4]" />}
      </button>
      {open && <div className="p-5 pt-0 border-t border-[#2a2d3d]">{children}</div>}
    </div>
  );
}

export default function EditProfilePage() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const avatarRef = useRef();
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    bio: '',
    headline: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    skills: [],
    experience: [],
    projects: [],
  });

  const [newSkill, setNewSkill] = useState({ name: '', level: 'Intermediate' });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        headline: user.headline || '',
        location: user.location || '',
        website: user.website || '',
        github: user.socialLinks?.github || '',
        linkedin: user.socialLinks?.linkedin || '',
        twitter: user.socialLinks?.twitter || '',
        skills: user.skills || [],
        experience: user.experience || [],
        projects: user.projects || [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('avatar', file);
    setAvatarUploading(true);
    try {
      const res = await userAPI.uploadAvatar(data);
      updateUser({ avatar: res.data.data.avatar });
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    if (form.skills.find(s => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
      toast.error('Skill already added');
      return;
    }
    setForm(p => ({ ...p, skills: [...p.skills, { ...newSkill }] }));
    setNewSkill({ name: '', level: 'Intermediate' });
  };

  const removeSkill = (name) => {
    setForm(p => ({ ...p, skills: p.skills.filter(s => s.name !== name) }));
  };

  const addExperience = () => {
    setForm(p => ({
      ...p,
      experience: [...p.experience, { title: '', company: '', startDate: '', endDate: '', current: false, description: '' }],
    }));
  };

  const updateExp = (idx, field, val) => {
    setForm(p => {
      const exp = [...p.experience];
      exp[idx] = { ...exp[idx], [field]: val };
      return { ...p, experience: exp };
    });
  };

  const removeExp = (idx) => {
    setForm(p => ({ ...p, experience: p.experience.filter((_, i) => i !== idx) }));
  };

  const addProject = () => {
    setForm(p => ({
      ...p,
      projects: [...p.projects, { title: '', description: '', techStack: [], githubUrl: '', liveUrl: '' }],
    }));
  };

  const updateProject = (idx, field, val) => {
    setForm(p => {
      const projects = [...p.projects];
      projects[idx] = { ...projects[idx], [field]: val };
      return { ...p, projects };
    });
  };

  const removeProject = (idx) => {
    setForm(p => ({ ...p, projects: p.projects.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        bio: form.bio,
        headline: form.headline,
        location: form.location,
        website: form.website,
        socialLinks: {
          github: form.github,
          linkedin: form.linkedin,
          twitter: form.twitter,
        },
        skills: form.skills,
        experience: form.experience,
        projects: form.projects,
      };
      const res = await userAPI.updateProfile(payload);
      updateUser(res.data.data.user);
      toast.success('Profile saved!');
      navigate(`/profile/${user.username}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-display font-bold">Edit Profile</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2">
          <Save size={15} />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {/* Avatar */}
      <div className="card p-5 rounded-xl flex items-center gap-5">
        <div className="relative">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff`}
            alt={user?.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary-500/30"
          />
          <button
            onClick={() => avatarRef.current.click()}
            disabled={avatarUploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
          >
            <Camera size={13} className="text-white" />
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-[#8892a4]">@{user?.username}</p>
          {avatarUploading && <p className="text-xs text-primary-400 mt-1">Uploading…</p>}
        </div>
      </div>

      {/* Basic Info */}
      <Section title="Basic Info">
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm text-[#8892a4] mb-1.5">Display Name</label>
            <input className="input w-full" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm text-[#8892a4] mb-1.5">Headline</label>
            <input className="input w-full" name="headline" value={form.headline} onChange={handleChange} placeholder="e.g. Full-Stack Engineer at Acme" />
          </div>
          <div>
            <label className="block text-sm text-[#8892a4] mb-1.5">Bio</label>
            <textarea
              className="input w-full resize-none"
              rows={4}
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell the community about yourself…"
            />
          </div>
          <div>
            <label className="block text-sm text-[#8892a4] mb-1.5">Location</label>
            <input className="input w-full" name="location" value={form.location} onChange={handleChange} placeholder="City, Country" />
          </div>
          <div>
            <label className="block text-sm text-[#8892a4] mb-1.5">Website</label>
            <input className="input w-full" name="website" value={form.website} onChange={handleChange} placeholder="https://yoursite.com" />
          </div>
        </div>
      </Section>

      {/* Social Links */}
      <Section title="Social Links" defaultOpen={false}>
        <div className="space-y-4 mt-4">
          {[
            { name: 'github', label: 'GitHub', placeholder: 'username' },
            { name: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/you' },
            { name: 'twitter', label: 'Twitter / X', placeholder: '@handle' },
          ].map((l) => (
            <div key={l.name}>
              <label className="block text-sm text-[#8892a4] mb-1.5">{l.label}</label>
              <input className="input w-full" name={l.name} value={form[l.name]} onChange={handleChange} placeholder={l.placeholder} />
            </div>
          ))}
        </div>
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={newSkill.name}
              onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))}
              placeholder="Add a skill (e.g. React)"
              onKeyDown={e => e.key === 'Enter' && addSkill()}
            />
            <select
              className="input w-36"
              value={newSkill.level}
              onChange={e => setNewSkill(p => ({ ...p, level: e.target.value }))}
            >
              {SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
            <button onClick={addSkill} className="btn-primary px-4 flex-shrink-0">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.skills.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 border border-primary-500/30 rounded-full text-sm">
                <span className="text-primary-300">{s.name}</span>
                <span className="text-[#8892a4] text-xs">· {s.level}</span>
                <button onClick={() => removeSkill(s.name)} className="text-[#8892a4] hover:text-red-400 transition-colors ml-1">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Experience */}
      <Section title="Experience" defaultOpen={false}>
        <div className="mt-4 space-y-5">
          {form.experience.map((exp, idx) => (
            <div key={idx} className="p-4 bg-[#13151e] rounded-xl border border-[#2a2d3d] space-y-3 relative">
              <button onClick={() => removeExp(idx)} className="absolute top-3 right-3 text-[#8892a4] hover:text-red-400 transition-colors">
                <X size={15} />
              </button>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8892a4] mb-1 block">Title</label>
                  <input className="input w-full text-sm" value={exp.title} onChange={e => updateExp(idx, 'title', e.target.value)} placeholder="Software Engineer" />
                </div>
                <div>
                  <label className="text-xs text-[#8892a4] mb-1 block">Company</label>
                  <input className="input w-full text-sm" value={exp.company} onChange={e => updateExp(idx, 'company', e.target.value)} placeholder="Acme Inc." />
                </div>
                <div>
                  <label className="text-xs text-[#8892a4] mb-1 block">Start Date</label>
                  <input className="input w-full text-sm" type="month" value={exp.startDate?.slice(0, 7)} onChange={e => updateExp(idx, 'startDate', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#8892a4] mb-1 block">End Date</label>
                  <input className="input w-full text-sm" type="month" value={exp.endDate?.slice(0, 7)} onChange={e => updateExp(idx, 'endDate', e.target.value)} disabled={exp.current} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={exp.current} onChange={e => updateExp(idx, 'current', e.target.checked)} className="rounded" />
                <span className="text-[#8892a4]">I currently work here</span>
              </label>
              <div>
                <label className="text-xs text-[#8892a4] mb-1 block">Description</label>
                <textarea className="input w-full text-sm resize-none" rows={3} value={exp.description} onChange={e => updateExp(idx, 'description', e.target.value)} placeholder="What did you build and learn?" />
              </div>
            </div>
          ))}
          <button onClick={addExperience} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Plus size={15} /> Add Experience
          </button>
        </div>
      </Section>

      {/* Projects */}
      <Section title="Projects" defaultOpen={false}>
        <div className="mt-4 space-y-5">
          {form.projects.map((proj, idx) => (
            <div key={idx} className="p-4 bg-[#13151e] rounded-xl border border-[#2a2d3d] space-y-3 relative">
              <button onClick={() => removeProject(idx)} className="absolute top-3 right-3 text-[#8892a4] hover:text-red-400 transition-colors">
                <X size={15} />
              </button>
              <div>
                <label className="text-xs text-[#8892a4] mb-1 block">Project Title</label>
                <input className="input w-full text-sm" value={proj.title} onChange={e => updateProject(idx, 'title', e.target.value)} placeholder="My Awesome Project" />
              </div>
              <div>
                <label className="text-xs text-[#8892a4] mb-1 block">Description</label>
                <textarea className="input w-full text-sm resize-none" rows={3} value={proj.description} onChange={e => updateProject(idx, 'description', e.target.value)} placeholder="What does it do?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8892a4] mb-1 block">GitHub URL</label>
                  <input className="input w-full text-sm" value={proj.githubUrl} onChange={e => updateProject(idx, 'githubUrl', e.target.value)} placeholder="github.com/…" />
                </div>
                <div>
                  <label className="text-xs text-[#8892a4] mb-1 block">Live URL</label>
                  <input className="input w-full text-sm" value={proj.liveUrl} onChange={e => updateProject(idx, 'liveUrl', e.target.value)} placeholder="https://…" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#8892a4] mb-1 block">Tech Stack (comma separated)</label>
                <input
                  className="input w-full text-sm"
                  value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                  onChange={e => updateProject(idx, 'techStack', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
            </div>
          ))}
          <button onClick={addProject} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Plus size={15} /> Add Project
          </button>
        </div>
      </Section>

      <div className="flex justify-end pb-8">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-8 py-2.5">
          <Save size={15} />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
