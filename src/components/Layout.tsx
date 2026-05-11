import React from 'react';
import Sidebar from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/GoogleAuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogIn, Sun, Moon, LogOut } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

const Layout: React.FC = () => {
  const { login, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'ปฏิทินการจอง';
    if (path === '/book') return 'จองห้องประชุม';
    if (path === '/rooms') return 'ห้องประชุม';
    if (path === '/admin') return 'ภาพรวม Admin';
    if (path === '/admin/bookings') return 'การจองทั้งหมด';
    if (path === '/admin/rooms') return 'จัดการห้องประชุม';
    if (path === '/admin/export') return 'ส่งออก Excel';
    if (path === '/settings') return 'ตั้งค่าระบบ';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header 
          className={`h-16 flex items-center justify-between px-8 shrink-0 backdrop-blur-xl z-10 border-b ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/60 border-slate-200'}`}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h2>
            <span style={{ color: 'var(--text-tertiary)' }}>/</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{getPageTitle()}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-md"
              style={{ 
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
              }}
              title={isDark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth Button */}
            {isAuthenticated ? (
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.05] hover:shadow-md"
                style={{ 
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                }}
              >
                <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
                ออกจากระบบ
              </button>
            ) : (
              <button 
                onClick={() => login()}
                className="btn-primary group flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <LogIn size={16} className="transition-transform group-hover:translate-x-1" />
                เข้าสู่ระบบด้วย Google
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {/* Animated Background Mesh Gradient (Subtle) */}
          <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 mix-blend-multiply dark:mix-blend-screen bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 animate-gradient" style={{ filter: 'blur(80px)' }}></div>
          
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Layout;
