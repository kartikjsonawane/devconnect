import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import RightPanel from '../components/layout/RightPanel';
import MobileNav from '../components/layout/MobileNav';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-7xl mx-auto flex gap-0 relative">
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 h-screen sticky top-0">
          <Sidebar />
        </aside>
        <main className="flex-1 min-w-0 border-x border-dark-border min-h-screen">
          <Outlet />
        </main>
        <aside className="hidden xl:block w-80 shrink-0 h-screen sticky top-0">
          <RightPanel />
        </aside>
      </div>
      <MobileNav />
    </div>
  );
}
