import React from 'react';
import { DoorOpen, CalendarCheck, Clock } from 'lucide-react';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

interface DashboardStatsProps {
  rooms: string[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ rooms }) => {
  const { todayEvents, activeEvents } = useCalendarEvents();

  const stats = [
    { label: 'ห้องประชุมทั้งหมด', value: String(rooms.length), icon: <DoorOpen className="text-blue-600" />, bgColor: 'bg-blue-100' },
    { label: 'การจองวันนี้', value: String(todayEvents.length), icon: <CalendarCheck className="text-green-600" />, bgColor: 'bg-green-100' },
    { label: 'กำลังใช้งาน', value: String(activeEvents.length), icon: <Clock className="text-amber-600" />, bgColor: 'bg-amber-100' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className={`${stat.bgColor} p-3 rounded-lg`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
