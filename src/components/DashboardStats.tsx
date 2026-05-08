import React from 'react';
import { DoorOpen, CalendarCheck, Clock } from 'lucide-react';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

interface DashboardStatsProps {
  rooms: string[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ rooms }) => {
  const { todayEvents, activeEvents } = useCalendarEvents();

  const stats = [
    { 
      label: 'ห้องประชุมทั้งหมด', 
      value: String(rooms.length), 
      icon: <DoorOpen size={22} />,
      gradient: 'var(--stat-blue-bg)',
      iconColor: 'var(--stat-blue-icon)',
    },
    { 
      label: 'การจองวันนี้', 
      value: String(todayEvents.length), 
      icon: <CalendarCheck size={22} />,
      gradient: 'var(--stat-green-bg)',
      iconColor: 'var(--stat-green-icon)',
    },
    { 
      label: 'กำลังใช้งาน', 
      value: String(activeEvents.length), 
      icon: <Clock size={22} />,
      gradient: 'var(--stat-amber-bg)',
      iconColor: 'var(--stat-amber-icon)',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="stat-card flex items-center gap-4"
          style={{ background: stat.gradient }}
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ 
              background: `${stat.iconColor}15`,
              color: stat.iconColor,
            }}
          >
            {stat.icon}
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
