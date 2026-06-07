import { Link } from 'react-router-dom';
import { Code2, Users, Zap, Star, GitBranch, Terminal, ChevronRight, Globe } from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'Code Sharing',
    desc: 'Share snippets with syntax highlighting across 50+ languages. Get feedback from real engineers.',
  },
  {
    icon: Users,
    title: 'Developer Network',
    desc: 'Follow engineers who inspire you. Build your network based on shared technologies and interests.',
  },
  {
    icon: Zap,
    title: 'Real-time Feed',
    desc: 'Live updates via WebSockets. No refresh needed — your feed updates as the community posts.',
  },
  {
    icon: Star,
    title: 'Skill Endorsements',
    desc: 'Get peers to endorse your skills. Build a credible, community-backed profile for recruiters.',
  },
  {
    icon: GitBranch,
    title: 'GitHub Integration',
    desc: 'Sync your GitHub stats and top repos directly to your profile. Showcase your work automatically.',
  },
  {
    icon: Globe,
    title: 'Global Explore',
    desc: 'Discover trending posts, top contributors, and engineers pushing the boundaries of tech.',
  },
];

const stats = [
  { value: '10K+', label: 'Developers' },
  { value: '50K+', label: 'Posts Shared' },
  { value: '200K+', label: 'Connections Made' },
  { value: '99.9%', label: 'Uptime' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e2e8f0]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2d3d]/60 bg-[#0f1117]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <Terminal size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">DevConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* BG glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-400 text-sm font-medium mb-6 animate-fade-in">
            <Zap size={12} />
            Built for developers, by developers
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold leading-[1.1] mb-6 animate-slide-up">
            Where engineers{' '}
            <span className="gradient-text">build, share,</span>
            <br />
            and grow together
          </h1>

          <p className="text-xl text-[#8892a4] max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            DevConnect is the professional network built specifically for software engineers. Share code, showcase projects, and connect with developers who push the industry forward.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/register" className="btn-primary text-base px-8 py-3 flex items-center justify-center gap-2">
              Join for free <ChevronRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">
              Sign in
            </Link>
          </div>
        </div>

        {/* Fake terminal preview */}
        <div className="max-w-3xl mx-auto mt-20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="card rounded-xl overflow-hidden border border-[#2a2d3d]">
            <div className="bg-[#13151e] px-4 py-3 flex items-center gap-2 border-b border-[#2a2d3d]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-[#8892a4] font-mono">devconnect.app/feed</span>
            </div>
            <div className="p-6 space-y-4">
              {/* Fake post 1 */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">S</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">Sarah Chen</span>
                    <span className="text-[#8892a4] text-xs">@sarahchen · 2m</span>
                    <span className="skill-tag text-xs">TypeScript</span>
                  </div>
                  <p className="text-sm text-[#c4cad6] mb-2">Just shipped a custom React hook that reduces re-renders by 40% using useMemo + structural equality. Game changer for large lists.</p>
                  <div className="bg-[#0d0f18] rounded-lg p-3 font-mono text-xs text-[#8892a4] border border-[#2a2d3d]">
                    <span className="text-violet-400">const</span> <span className="text-sky-400">useDeepMemo</span> = {'<T>'}(value: T) =&gt; {'{'}<br />
                    &nbsp;&nbsp;<span className="text-violet-400">const</span> ref = <span className="text-sky-400">useRef</span>{'<T>'}(value);<br />
                    &nbsp;&nbsp;<span className="text-violet-400">if</span> (!<span className="text-sky-400">isEqual</span>(ref.current, value)) ref.current = value;<br />
                    &nbsp;&nbsp;<span className="text-violet-400">return</span> ref.current;<br />
                    {'}'}
                  </div>
                </div>
              </div>
              {/* Fake post 2 */}
              <div className="flex gap-3 opacity-60">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">M</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">Marcus Webb</span>
                    <span className="text-[#8892a4] text-xs">@mwebb · 15m</span>
                    <span className="skill-tag text-xs">Rust</span>
                  </div>
                  <p className="text-sm text-[#c4cad6]">Hot take: Rust's borrow checker is the best thing that ever happened to systems programming. It made me a better C++ developer too.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-[#2a2d3d]/60">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-display font-bold gradient-text mb-1">{s.value}</div>
              <div className="text-sm text-[#8892a4]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything a developer needs</h2>
            <p className="text-[#8892a4] text-lg max-w-xl mx-auto">Built from the ground up with the developer experience as the top priority.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card p-6 rounded-xl hover:border-primary-500/40 transition-colors group">
                <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                  <f.icon size={20} className="text-primary-400" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[#8892a4] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to join the community?</h2>
          <p className="text-[#8892a4] mb-8 text-lg">Start connecting with thousands of engineers today. It's free.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-3 inline-flex items-center gap-2">
            Create your profile <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2d3d]/60 py-8 px-6 text-center text-sm text-[#8892a4]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Terminal size={14} className="text-primary-400" />
          <span className="font-display font-semibold text-[#e2e8f0]">DevConnect</span>
        </div>
        <p>Built with React, Node.js, MongoDB & Socket.io</p>
      </footer>
    </div>
  );
}
