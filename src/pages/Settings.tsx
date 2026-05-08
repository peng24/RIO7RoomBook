import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const sections = [
    { title: 'ทั่วไป', icon: <SettingsIcon size={20} />, items: ['ข้อมูลองค์กร', 'ภาษาและภูมิภาค'] },
    { title: 'การแจ้งเตือน', icon: <Bell size={20} />, items: ['การแจ้งเตือนอีเมล', 'การแจ้งเตือนในระบบ'] },
    { title: 'ความปลอดภัย', icon: <Shield size={20} />, items: ['สิทธิ์การใช้งาน (RBAC)', 'Google API Configuration'] },
    { title: 'การแสดงผล', icon: <Palette size={20} />, items: ['ธีม (มืด/สว่าง)', 'การแสดงผลปฏิทิน'] },
  ];

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>ตั้งค่าระบบ</h1>
        <p style={{ color: 'var(--text-secondary)' }}>จัดการการตั้งค่าต่างๆ ของระบบจองห้องประชุม</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section) => (
          <div key={section.title} className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-primary)] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                {section.icon}
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{section.title}</h3>
            </div>
            
            <div className="space-y-2">
              {section.items.map(item => (
                <button 
                  key={item}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors group"
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] group-hover:text-blue-500 transition-colors">
                    <Globe size={16} />
                  </div>
                </button>
              ))}
              
              {section.title === 'การแสดงผล' && (
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>โหมดมืด</span>
                  <button 
                    onClick={toggleTheme}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDark ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
