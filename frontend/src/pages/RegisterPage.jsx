import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const val = e.target.name === 'username' ? e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: val }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name required';
    if (!form.username || form.username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (!form.email) errs.email = 'Email required';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to DevConnect');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-display font-bold text-dark-text mb-1">Join DevConnect</h2>
      <p className="text-dark-muted mb-8">Create your developer profile in seconds</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-dark-muted mb-1.5">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange}
              className={`input ${errors.name ? 'border-red-500' : ''}`} placeholder="Jane Smith" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-muted mb-1.5">Username</label>
            <input name="username" value={form.username} onChange={handleChange}
              className={`input ${errors.username ? 'border-red-500' : ''}`} placeholder="janedoe" />
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-muted mb-1.5">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            className={`input ${errors.email ? 'border-red-500' : ''}`} placeholder="jane@example.com" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-muted mb-1.5">Password</label>
          <div className="relative">
            <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange}
              className={`input pr-10 ${errors.password ? 'border-red-500' : ''}`} placeholder="Min 8 characters" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-text">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
          <UserPlus size={18} />
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-xs text-dark-muted text-center mt-4">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>

      <div className="mt-4 text-center">
        <p className="text-dark-muted text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
