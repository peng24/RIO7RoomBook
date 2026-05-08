import React from 'react';
import Sidebar from './Sidebar';
import DashboardStats from './DashboardStats';
import MyCalendar from './Calendar';
import QuickBook from './QuickBook';
import { useAuth } from '../context/GoogleAuthContext';
import { LogIn } from 'lucide-react';

const Layout: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const rooms = ['ห้องประชุม 1', 'ห้องประชุม 2', 'ห้องประชุม 3', 'ห้องบอร์ดรูม'];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500 text-sm">ปฏิทินการจอง</span>
          </div>
          
          <div className="flex items-center gap-4">
            {!isAuthenticated && (
              <button 
                onClick={() => login()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <LogIn size={18} />
                เข้าสู่ระบบด้วย Google
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <DashboardStats rooms={rooms} />
          
          <div className="flex gap-8">
            <div className="flex-1 min-w-0">
              <MyCalendar />
            </div>
            <QuickBook />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
