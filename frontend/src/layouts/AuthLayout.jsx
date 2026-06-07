import { Outlet } from 'react-router-dom';
import { Code2 } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-dark-bg flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 bg-gradient-to-br from-dark-card via-dark-bg to-dark-bg border-r border-dark-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-cyan-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Code2 className="text-white" size={22} />
            </div>
            <span className="font-display text-2xl font-bold text-dark-text">DevConnect</span>
          </div>
          <h1 className="text-5xl font-display font-bold text-dark-text mb-6 leading-tight">
            Where developers<br />
            <span className="gradient-text">connect & grow</span>
          </h1>
          <p className="text-dark-muted text-lg mb-10 leading-relaxed">
            Join 50,000+ developers sharing projects, learning together, and building their careers.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[{ stat: '50K+', label: 'Developers' },{ stat: '200K+', label: 'Posts Shared' },{ stat: '1.2M', label: 'Connections' },{ stat: '98%', label: 'Satisfaction' }].map(({ stat, label }) => (
              <div key={label} className="card p-4">
                <div className="text-2xl font-display font-bold text-primary-400">{stat}</div>
                <div className="text-dark-muted text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Code2 className="text-white" size={16} />
            </div>
            <span className="font-display text-xl font-bold">DevConnect</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
