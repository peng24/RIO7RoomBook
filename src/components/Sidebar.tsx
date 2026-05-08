import React from 'react';
import { 
  Calendar, 
  PlusSquare, 
  UserCircle, 
  DoorOpen, 
  LayoutDashboard, 
  List, 
  Settings, 
  Users, 
  FileSpreadsheet 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const mainMenu = [
    { name: 'ปฏิทินการจอง', icon: <Calendar size={20} />, active: true },
    { name: 'จองห้อง', icon: <PlusSquare size={20} /> },
    { name: 'การจองของฉัน', icon: <UserCircle size={20} /> },
    { name: 'ห้องประชุม', icon: <DoorOpen size={20} /> },
  ];

  const adminMenu = [
    { name: 'ภาพรวม Admin', icon: <LayoutDashboard size={20} /> },
    { name: 'การจองทั้งหมด', icon: <List size={20} /> },
    { name: 'จัดการห้อง', icon: <DoorOpen size={20} /> },
    { name: 'จัดการผู้ใช้', icon: <Users size={20} /> },
    { name: 'ส่งออก Excel', icon: <FileSpreadsheet size={20} /> },
    { name: 'ตั้งค่าระบบ', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-blue-400">Room</span>Book
        </h1>
        <p className="text-xs text-slate-400 mt-1">ระบบจองห้องประชุม</p>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-4 px-2">Main Menu</p>
          <ul className="space-y-1">
            {mainMenu.map((item) => (
              <li key={item.name}>
                <a
                  href="#"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    item.active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-4 px-2">Admin Menu</p>
          <ul className="space-y-1">
            {adminMenu.map((item) => (
              <li key={item.name}>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
            RB
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Room Book</p>
            <p className="text-xs text-slate-500 truncate">ระบบจองห้องประชุม</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
