import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Calendar, 
  PlusSquare, 
  DoorOpen, 
  LayoutDashboard, 
  List, 
  Settings, 
  FileSpreadsheet 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const mainMenu = [
    { name: 'ปฏิทินการจอง', icon: <Calendar size={20} />, path: '/' },
    { name: 'จองห้อง', icon: <PlusSquare size={20} />, path: '/book' },
    { name: 'ห้องประชุม', icon: <DoorOpen size={20} />, path: '/rooms' },
  ];

  const adminMenu = [
    { name: 'ภาพรวม Admin', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'การจองทั้งหมด', icon: <List size={20} />, path: '/admin/bookings' },
    { name: 'จัดการห้อง', icon: <DoorOpen size={20} />, path: '/admin/rooms' },
    { name: 'ส่งออก Excel', icon: <FileSpreadsheet size={20} />, path: '/admin/export' },
    { name: 'ตั้งค่าระบบ', icon: <Settings size={20} />, path: '/settings' },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'text-white font-medium shadow-lg' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  const activeStyle = { 
    background: 'var(--accent-gradient)', 
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' 
  };

  return (
    <div className="w-64 h-screen flex flex-col shrink-0" style={{ background: 'var(--bg-sidebar)' }}>
      {/* Logo */}
      <div className="p-5 pb-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="RIO7"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              RIO<span style={{ color: '#60a5fa' }}>7</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">ระบบจองห้องประชุม</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-3 px-3">เมนูหลัก</p>
          <ul className="space-y-1">
            {mainMenu.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={navLinkClass}
                  style={({ isActive }) => isActive ? activeStyle : {}}
                >
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-3 px-3">ผู้ดูแลระบบ</p>
          <ul className="space-y-1">
            {adminMenu.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={navLinkClass}
                  style={({ isActive }) => isActive ? activeStyle : {}}
                >
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2">
          <img src="/logo.png" alt="RIO7" className="w-8 h-8 object-contain" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">RIO7</p>
            <p className="text-[10px] text-slate-500 truncate">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
